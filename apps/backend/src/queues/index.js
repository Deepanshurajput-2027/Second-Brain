import { queueService } from './queue.service.js';

export const startWorkers = async () => {
  // Dynamically import the worker to initialize it when requested
  const { startAiWorker } = await import('./ai.worker.js');
  
  const aiWorker = startAiWorker();
  
  return {
    aiWorker
  };
};

export { queueService };
