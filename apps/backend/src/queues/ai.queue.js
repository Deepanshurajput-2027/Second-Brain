import { Queue } from 'bullmq';
import { connection } from './redis.config.js';

export const aiQueueName = 'knowledge-ai-processing';

export const aiQueue = new Queue(aiQueueName, {
  connection,
});
