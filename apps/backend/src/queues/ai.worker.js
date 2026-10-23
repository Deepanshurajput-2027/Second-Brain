import { Worker } from 'bullmq';
import axios from 'axios';
import crypto from 'crypto';
import { connection } from './redis.config.js';
import { aiQueueName } from './ai.queue.js';
import Memory from '../modules/memory/memory.model.js';
import { qdrantClient } from '../database/qdrant.config.js';
import { GoogleGenAI } from '@google/genai';
import { withExponentialBackoff } from '../utils/retryPrompt.js';
import logger from '../utils/logger/logger.js';
import { ExtractorService } from '../utils/extractors/extractor.service.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const parseAIResponse = (text) => {
  try {
    let cleanText = text.replace(/```(json)?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error('AI response was not valid JSON');
  }
};

const processAiJob = async (job) => {
  const { memoryId, userId, url, type, mimetype } = job.data;
  logger.info(`[Worker] Starting processing for memoryId: ${memoryId}`);

  try {
    await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'processing' });

    let summary = '';
    let tags = [];
    let title = '';

    if (type === 'url') {
      let extractedText = '';
      try {
        extractedText = await ExtractorService.scrapeUrl(url);
      } catch (scrapeError) {
        logger.warn(`[Worker] Scrape failed for ${url}: ${scrapeError.message}`);
        extractedText = '';
      }

      console.log(`[Scraper] Extracted text length: ${extractedText ? extractedText.length : 0}`);

      // Strict Content Validation: Check if extracted text is null/empty or < 50 characters
      if (!extractedText || extractedText.trim().length < 50) {
        logger.info(`[Worker] Extracted text too short (< 50 chars) for memoryId: ${memoryId}. Skipping Gemini LLM.`);
        summary = 'No readable content found.';
        tags = [];

        // Fallback title from domain or existing title
        let fallbackDomain = 'Saved Link';
        try {
          fallbackDomain = new URL(url).hostname;
        } catch (e) {
          logger.warn(`[Worker] Failed to parse URL for fallback domain: ${e.message}`);
        }

        const existingMemory = await Memory.findById(memoryId);
        title = (existingMemory && existingMemory.title && existingMemory.title !== 'Saved Link')
          ? existingMemory.title
          : fallbackDomain;
      } else {
        // Max Token Protection: Apply strict 15,000 char slice
        const contentForAi = extractedText.substring(0, 15000);

        const prompt = `
        You are an expert technical summarizer. Read the following text scraped from a webpage and provide:
        1. A concise, 2-sentence summary of the main points.
        2. An array of 3-5 relevant tags (lowercase, single words or hyphenated).
        
        Respond STRICTLY with a valid JSON object matching this structure:
        {
          "summary": "The 2 sentence summary here.",
          "tags": ["tag1", "tag2", "tag3"],
          "title": "Extracted or inferred title"
        }
        
        Text to analyze:
        """
        ${contentForAi}
        """
      `;

        const response = await withExponentialBackoff(() => ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        }));

        const parsedData = parseAIResponse(response.text);
        summary = parsedData.summary || 'No readable content found.';
        tags = Array.isArray(parsedData.tags) ? parsedData.tags : [];
        title = parsedData.title || '';
      }

    } else if (type === 'file') {
      const fileResponse = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(fileResponse.data, 'binary');

      const prompt = `
        You are an expert technical summarizer. Read the following uploaded file and provide:
        1. A concise, 2-sentence summary of the main points.
        2. An array of 3-5 relevant tags (lowercase, single words or hyphenated).
        
        Respond STRICTLY with a valid JSON object matching this structure:
        {
          "summary": "The 2 sentence summary here.",
          "tags": ["tag1", "tag2", "tag3"],
          "title": "Extracted or inferred title"
        }
      `;

      const response = await withExponentialBackoff(() => ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
          {
            inlineData: {
              data: buffer.toString('base64'),
              mimeType: mimetype
            }
          },
          prompt
        ],
        config: { responseMimeType: 'application/json' }
      }));

      const parsedData = parseAIResponse(response.text);
      summary = parsedData.summary || 'No readable content found.';
      tags = Array.isArray(parsedData.tags) ? parsedData.tags : [];
      title = parsedData.title || '';
    }

    // Step 1: Save summary, tags, title to MongoDB (keep aiStatus as 'processing' until vector is stored)
    const updatePayload = {
      summary,
      tags,
    };
    if (title) {
      updatePayload.title = title;
    }

    const updatedMemory = await Memory.findByIdAndUpdate(memoryId, updatePayload, { new: true });

    // Step 2: Generate embedding and upsert to Qdrant
    // Only mark aiStatus='completed' AFTER the vector is safely stored
    try {
      const tagString = (updatedMemory.tags && updatedMemory.tags.length > 0) ? updatedMemory.tags.join(', ') : '';
      const textToEmbed = `Title: ${updatedMemory.title || ''}\nSummary: ${updatedMemory.summary || ''}\nTags: ${tagString}`.trim();
      
      const embeddingRes = await withExponentialBackoff(() => ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: textToEmbed || 'Memory',
      }));

      const vector = embeddingRes.embeddings[0].values;
      const pointId = crypto.randomUUID();

      await qdrantClient.upsert('knowledge_vectors', {
        wait: true,
        points: [
          {
            id: pointId,
            vector: vector,
            payload: {
              mongo_id: memoryId,
            }
          }
        ]
      });
      logger.info(`[Worker] Successfully upserted vector for memoryId: ${memoryId}`);

      // Step 3: Only now mark as completed — summary, tags, AND vector are all persisted
      await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'completed' });
    } catch (embeddingError) {
      logger.error(`[Worker] Failed to generate/upsert embedding for ${memoryId}: ${embeddingError.message}`);
      // Throw the error so BullMQ can retry or mark the job as failed
      throw embeddingError;
    }

    logger.info(`[Worker] Finished processing for memoryId: ${memoryId}`);


  } catch (error) {
    logger.error(`[Worker] Error processing job for memoryId ${memoryId}: ${error.message}`);
    throw error;
  }
};

export const startAiWorker = () => {
  const worker = new Worker(aiQueueName, processAiJob, { connection });

  worker.on('completed', (job) => {
    logger.info(`[Worker] Job ${job.id} completed!`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`[Worker] Job ${job.id} failed: ${err.message}`);
    if (job.attemptsMade >= job.opts.attempts) {
      try {
        const { memoryId } = job.data;
        await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'failed' });
        logger.error(`[Worker] Job ${job.id} exhausted retries. Marked ${memoryId} as failed.`);
      } catch (dbError) {
        logger.error(`[Worker] Failed to update status to failed: ${dbError.message}`);
      }
    }
  });

  return worker;
};