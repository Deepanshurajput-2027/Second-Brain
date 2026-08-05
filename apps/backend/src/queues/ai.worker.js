import { Worker } from 'bullmq';
import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { connection } from './redis.config.js';
import { aiQueueName } from './ai.queue.js';
import Memory from '../modules/memory/memory.model.js';
import { qdrantClient } from '../database/qdrant.config.js';
import { GoogleGenAI } from '@google/genai';
import { withExponentialBackoff } from '../utils/retryPrompt.js';
import logger from '../utils/logger/logger.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const parseAIResponse = (text) => {
  try {
    let cleanText = text.replace(/```(json)?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error('AI response was not valid JSON');
  }
};

const scrapeUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || '';
    const siteName = $('meta[property="og:site_name"]').attr('content') || '';

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYouTube) return `Video Title: ${title}\n\nVideo Description: ${description}`;

    $('script, style, noscript, iframe, img, svg, video').remove();
    let extractedText = '';
    $('article, main, p, h1, h2, h3').each((i, el) => { extractedText += $(el).text() + ' '; });
    if (!extractedText.trim()) extractedText = $('body').text();

    let cleanText = extractedText.replace(/\s+/g, ' ').trim();
    if (cleanText.length > 8000) cleanText = cleanText.substring(0, 8000) + '...';

    return `Title: ${title}\nDescription: ${description}\n\nContent:\n${cleanText}`.trim() || 'No text found.';
  } catch (error) {
    logger.error(`Scraping failed for ${url}: ${error.message}`);
    throw new Error(`Failed to scrape URL: ${url}`);
  }
};

const processAiJob = async (job) => {
  const { memoryId, userId, url, type, mimetype } = job.data;
  logger.info(`[Worker] Starting processing for memoryId: ${memoryId}`);

  try {
    await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'processing' });

    let response;
    
    if (type === 'url') {
      let scrapedText;
      let isFallback = false;
      let fallbackDomain = 'Saved Link';

      try {
        scrapedText = await scrapeUrl(url);
      } catch (scrapeError) {
        logger.warn(`[Worker] Scrape failed for ${url}, using fallback.`);
        isFallback = true;
        try { 
          fallbackDomain = new URL(url).hostname; 
        } catch (e) {
          logger.warn(`[Worker] Failed to parse URL for fallback domain: ${e.message}`);
        }
        scrapedText = `Title: ${fallbackDomain}\nDescription: This content could not be automatically scraped due to access restrictions or paywalls. Please visit the original link.\n\nContent:\nThis content could not be automatically scraped due to access restrictions or paywalls. Please visit the original link.`;
      }

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
        ${scrapedText}
        """
      `;

      response = await withExponentialBackoff(() => ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      }));
      
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

      response = await withExponentialBackoff(() => ai.models.generateContent({
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
    }

    const parsedData = parseAIResponse(response.text);

    // Save summary and tags to MongoDB
    const updatedMemory = await Memory.findByIdAndUpdate(memoryId, {
      summary: parsedData.summary,
      tags: parsedData.tags,
      title: parsedData.title,
    }, { new: true });

    // Qdrant Embeddings
    try {
      const textToEmbed = `Title: ${updatedMemory.title}\nSummary: ${updatedMemory.summary}\nTags: ${updatedMemory.tags.join(', ')}`;
      
      const embeddingRes = await withExponentialBackoff(() => ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: textToEmbed,
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
    } catch (embeddingError) {
      logger.error(`[Worker] Failed to generate/upsert embedding for ${memoryId}: ${embeddingError.message}`);
      // Throw the error so the entire job fails and MongoDB doesn't get out of sync with a 'completed' status
      throw embeddingError;
    }

    await Memory.findByIdAndUpdate(memoryId, { aiStatus: 'completed' });
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