import { Worker } from 'bullmq';
import axios from 'axios';
import { connection } from './redis.config.js';
import { aiQueueName } from './ai.queue.js';
import { KnowledgeRepository } from '../modules/knowledge/knowledge.repository.js';
import { AI_STATUS } from '../modules/knowledge/knowledge.constants.js';
import logger from '../utils/logger/logger.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

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

    const textToProcess = knowledge.content || knowledge.title;
    if (!textToProcess) {
      throw new Error(`Knowledge with ID ${knowledgeId} has no content or title to process.`);
    }

    // 3. HTTP Payload Execution (10s timeout limit)
    const response = await axios.post(
      `${AI_SERVICE_URL}/api/v1/process`,
      { text: textToProcess },
      { timeout: 10000 }
    );

    // DEBUG LOG: See exactly what Python returns
    logger.info(`AI Microservice Response Raw Data: ${JSON.stringify(response.data)}`);

    const { embedding, tags } = response.data;

    // 4. Database Integration
    await KnowledgeRepository.updateKnowledge(knowledgeId, { 
      tags: tags || [],
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