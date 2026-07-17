import { Worker } from 'bullmq';
import axios from 'axios';
import { connection } from './redis.config.js';
import { aiQueueName } from './ai.queue.js';
import { KnowledgeRepository } from '../modules/knowledge/knowledge.repository.js';
import { AI_STATUS } from '../modules/knowledge/knowledge.constants.js';
import logger from '../utils/logger/logger.js';
import { qdrantClient } from '../database/qdrant.config.js';
import { ExtractorService } from '../utils/extractors/extractor.service.js';
import { GoogleGenAI } from '@google/genai';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';
const gemini = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY from environment

const objectIdToUuid = (objectId) => {
  const padded = String(objectId).padEnd(32, '0');
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
};

const processAiJob = async (job) => {
  const { knowledgeId, userId } = job.data;

  logger.info(`Starting AI processing for knowledgeId: ${knowledgeId}`);

  try {
    // 1. Mark as PROCESSING
    await KnowledgeRepository.updateKnowledge(knowledgeId, { aiStatus: AI_STATUS.PROCESSING });

    // 2. Fetch Content (Fallback to title if content is empty)
    const knowledge = await KnowledgeRepository.findKnowledgeById(knowledgeId);
    if (!knowledge) {
      throw new Error(`Knowledge with ID ${knowledgeId} not found.`);
    }

    const fallbackContent = knowledge.content || knowledge.title || '';
    
    // Step 1: Deep Extraction
    const extractedText = await ExtractorService.extract(
      knowledge.sourceType, 
      knowledge.sourceUrl, 
      fallbackContent
    );

    if (!extractedText) {
      throw new Error(`Knowledge with ID ${knowledgeId} resulted in empty extraction.`);
    }

    // Step 2: HTTP Payload Execution (10s timeout limit)
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/process`,
      { text: extractedText },
      { timeout: 10000 }
    );

    // DEBUG LOG: See exactly what Python returns
    logger.info(`AI Microservice Response Raw Data: ${JSON.stringify(response.data)}`);

    let { embedding, tags: pythonTags } = response.data;
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
      embedding = embedding[0]; // Flatten if 2D
    }

   // Step 3 & 4: Gemini LLM for Summary and Tags
    let summary = '';
    let finalTags = pythonTags || [];
    try {
      logger.info(`Calling Gemini for summary and tags...`);
      // Reduced to 8000 chars to save input tokens!
      const geminiPrompt = `Analyze this text. Return a strict raw JSON object with no markdown formatting containing exactly two keys: 'summary' (a concise 2-sentence TL;DR) and 'tags' (an array of 3 to 5 lowercase keyword strings).\n\nText: ${extractedText.substring(0, 8000)}`;
      
      const geminiResponse = await gemini.models.generateContent({
        model: 'gemini-3.1-flash-lite', // 🔥 The highly efficient, free-tier model
        contents: geminiPrompt,
      });

      let jsonStr = geminiResponse.text.trim();
      // Remove any accidental markdown backticks
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);

      const parsed = JSON.parse(jsonStr.trim());
      summary = parsed.summary || '';
      if (parsed.tags && Array.isArray(parsed.tags)) {
        finalTags = parsed.tags;
      }
      logger.info(`Gemini successfully extracted summary and tags.`);
    } catch (llmError) {
      logger.error(`Gemini LLM extraction failed, degrading gracefully: ${llmError.message}`);
      // Don't crash the queue, degrade gracefully
    }

    // 4. Qdrant Vector Upsert
    if (embedding && embedding.length > 0) {
      await qdrantClient.upsert('knowledge_vectors', {
        wait: true,
        points: [{
          id: objectIdToUuid(knowledgeId),
          vector: embedding,
          payload: {
            knowledgeId: String(knowledgeId),
            userId: String(userId),
            title: knowledge.title || '',
            sourceType: knowledge.sourceType || 'unknown'
          }
        }]
      });
      logger.info(`Successfully upserted vector to Qdrant for knowledgeId: ${knowledgeId}`);
    }

    // 5. Database Integration
    await KnowledgeRepository.updateKnowledge(knowledgeId, { 
      tags: finalTags,
      summary,
      extractedText,
      metadata: {
        ...(knowledge.metadata || {}),
        embedding: embedding || []
      },
      aiStatus: AI_STATUS.COMPLETED 
    });
    
    logger.info(`Successfully completed AI processing for knowledgeId: ${knowledgeId}`);
  } catch (error) {
    logger.error(`Error processing AI job for knowledgeId: ${knowledgeId}: ${error.message}`, { error });
    // Throw error so BullMQ can retry
    throw error;
  }
};

export const startAiWorker = () => {
  const worker = new Worker(aiQueueName, processAiJob, { connection });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} has completed!`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
    
    // If the job has exhausted all attempts, mark the DB status as FAILED
    if (job.attemptsMade >= job.opts.attempts) {
      try {
        const { knowledgeId } = job.data;
        await KnowledgeRepository.updateKnowledge(knowledgeId, { aiStatus: AI_STATUS.FAILED });
        logger.error(`Job ${job.id} exhausted retries. Marked knowledgeId: ${knowledgeId} as FAILED.`);
      } catch (dbError) {
        logger.error(`Failed to update knowledge status to FAILED for job ${job.id}: ${dbError.message}`);
      }
    }
  });

  return worker;
};