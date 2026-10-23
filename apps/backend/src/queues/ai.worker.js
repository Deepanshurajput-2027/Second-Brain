import { Worker } from 'bullmq';
import axios from 'axios';
import crypto from 'crypto';
import { connection } from './redis.config.js';
import { aiQueueName } from './ai.queue.js';
import Memory from '../modules/memory/memory.model.js';
import { qdrantClient } from '../database/qdrant.config.js';
import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger/logger.js';
import { ExtractorService } from '../utils/extractors/extractor.service.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Exponential backoff — retries on 429, 500, 503 and timeouts
const withRetry = async (fn, maxRetries = 3, initialDelay = 1500) => {
  let delay = initialDelay;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.status || err.response?.status || err?.error?.code;
      const isRetryable = status === 429 || status === 503 || status === 500
        || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT'
        || err.message?.includes('overloaded') || err.message?.includes('timeout');

      if (isRetryable && attempt < maxRetries) {
        logger.warn(`[Worker] Retryable error (${err.message}), attempt ${attempt + 1}/${maxRetries}. Waiting ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
};

const parseAIResponse = (text) => {
  try {
    let cleanText = text.replace(/```(json)?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    // Try extracting JSON from within the response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (_) {}
    }
    throw new Error(`AI response was not valid JSON. Raw: ${text?.slice(0, 200)}`);
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

      logger.info(`[Worker] Extracted text length: ${extractedText?.length ?? 0} for memoryId: ${memoryId}`);

      if (!extractedText || extractedText.trim().length < 50) {
        // Content too short — use domain as title, but still try to tag via URL metadata
        logger.info(`[Worker] Content too short, using domain fallback for memoryId: ${memoryId}`);
        let fallbackDomain = 'Saved Link';
        try { fallbackDomain = new URL(url).hostname; } catch (_) {}
        const existingMemory = await Memory.findById(memoryId);
        title = (existingMemory?.title && existingMemory.title !== 'Saved Link')
          ? existingMemory.title : fallbackDomain;
        summary = 'Content could not be extracted from this source.';
        tags = [];
      } else {
        // Limit to 12,000 chars to stay well within token limits
        const contentForAi = extractedText.substring(0, 12000);

        const prompt = `You are an expert technical summarizer. Read the following text and provide:
1. A concise 2-sentence summary.
2. An array of 3-5 relevant lowercase tags (single words or hyphenated).

Respond ONLY with a valid JSON object:
{"summary": "...", "tags": ["tag1", "tag2"], "title": "..."}

Text:
"""
${contentForAi}
"""`;

        let response;
        try {
          response = await withRetry(() => ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          }));
        } catch (llmError) {
          // LLM failed — use domain as fallback instead of crashing the job
          logger.warn(`[Worker] LLM generation failed for ${memoryId}: ${llmError.message}. Using content fallback.`);
          let fallbackDomain = 'Saved Link';
          try { fallbackDomain = new URL(url).hostname; } catch (_) {}
          const existingMemory = await Memory.findById(memoryId);
          title = existingMemory?.title || fallbackDomain;
          summary = 'AI summarization temporarily unavailable. Content saved successfully.';
          tags = [];

          // Still save and embed what we have — don't fail the job
          await saveAndEmbed(memoryId, { summary, tags, title });
          return;
        }

        const parsedData = parseAIResponse(response.text);
        summary = parsedData.summary || 'No readable content found.';
        tags = Array.isArray(parsedData.tags) ? parsedData.tags : [];
        title = parsedData.title || '';
      }

    } else if (type === 'file') {
      const fileResponse = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const buffer = Buffer.from(fileResponse.data, 'binary');

      const prompt = `You are an expert technical summarizer. Read the uploaded file and provide:
1. A concise 2-sentence summary.
2. An array of 3-5 relevant lowercase tags.

Respond ONLY with a valid JSON object:
{"summary": "...", "tags": ["tag1", "tag2"], "title": "..."}`;

      let response;
      try {
        response = await withRetry(() => ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',
          contents: [
            { inlineData: { data: buffer.toString('base64'), mimeType: mimetype } },
            prompt
          ],
          config: { responseMimeType: 'application/json' }
        }));
      } catch (llmError) {
        logger.warn(`[Worker] LLM generation failed for file ${memoryId}: ${llmError.message}. Using filename fallback.`);
        const existingMemory = await Memory.findById(memoryId);
        title = existingMemory?.title || 'Uploaded File';
        summary = 'AI summarization temporarily unavailable. File saved successfully.';
        tags = [];
        await saveAndEmbed(memoryId, { summary, tags, title });
        return;
      }

      const parsedData = parseAIResponse(response.text);
      summary = parsedData.summary || 'No readable content found.';
      tags = Array.isArray(parsedData.tags) ? parsedData.tags : [];
      title = parsedData.title || '';
    }

    await saveAndEmbed(memoryId, { summary, tags, title });
    logger.info(`[Worker] Finished processing for memoryId: ${memoryId}`);

  } catch (error) {
    logger.error(`[Worker] Error processing job for memoryId ${memoryId}: ${error.message}`);
    throw error;
  }
};

/**
 * Saves summary/tags/title to MongoDB, generates embedding, upserts to Qdrant,
 * and only then marks aiStatus='completed'.
 */
const saveAndEmbed = async (memoryId, { summary, tags, title }) => {
  // Step 1: Save content fields (keep status as 'processing')
  const updatePayload = { summary, tags };
  if (title) updatePayload.title = title;

  const updatedMemory = await Memory.findByIdAndUpdate(memoryId, updatePayload, { new: true });

  // Step 2: Generate embedding and upsert to Qdrant
  try {
    const tagString = updatedMemory.tags?.length > 0 ? updatedMemory.tags.join(', ') : '';
    const textToEmbed = `Title: ${updatedMemory.title || ''}\nSummary: ${updatedMemory.summary || ''}\nTags: ${tagString}`.trim();

    const embeddingRes = await withRetry(() => ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: textToEmbed || 'Memory',
    }));

    const vector = embeddingRes.embeddings[0].values;
    const pointId = crypto.randomUUID();

    await qdrantClient.upsert('knowledge_vectors', {
      wait: true,
      points: [{ id: pointId, vector, payload: { mongo_id: memoryId } }]
    });

    logger.info(`[Worker] Successfully upserted vector for memoryId: ${memoryId}`);
  } catch (embeddingError) {
    logger.error(`[Worker] Embedding/Qdrant failed for ${memoryId}: ${embeddingError.message}`);
    // Mark as completed anyway — user still has their summary/tags
    // Semantic search won't work for this item but the rest of the app will
    await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'completed' });
    return;
  }

  // Step 3: Mark as completed only after vector is safely stored
  await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'completed' });
};

export const startAiWorker = () => {
  const worker = new Worker(aiQueueName, processAiJob, {
    connection,
    concurrency: 2, // Process up to 2 jobs simultaneously
  });

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