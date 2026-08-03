import { aiQueue } from './ai.queue.js';
import logger from '../utils/logger/logger.js';

export const queueService = {
  /**
   * Dispatches a job to the AI processing queue.
   * @param {string} knowledgeId - The ID of the knowledge item to process.
   * @param {string} userId - The ID of the user owning the knowledge item.
   */
  dispatchAiProcessing: async (knowledgeId, userId) => {
    try {
      await aiQueue.add(
        'process-knowledge',
        { knowledgeId, userId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
      logger.info(`Dispatched AI processing job for knowledgeId: ${knowledgeId}`);
    } catch (error) {
      logger.error(`Failed to dispatch AI processing job: ${error.message}`, { error });
      throw error;
    }
  },
};
