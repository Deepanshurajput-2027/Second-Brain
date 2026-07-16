import Redis from 'ioredis';
import logger from '../utils/logger/logger.js';

/**
 * Configure singleton ioredis connection for BullMQ
 * BullMQ requires maxRetriesPerRequest to be null
 */
const redisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  family: 0, // Enforce IPv4 to avoid network resolution issues with cloud providers
};

// If process.env.REDIS_URL is a string, ioredis can parse it directly.
const connection = new Redis(process.env.REDIS_URL, redisOptions);

connection.on('connect', () => {
  logger.info('Connected to Redis successfully for BullMQ queues');
});

connection.on('error', (err) => {
  logger.error('Redis connection error:', { error: err.message });
});

export { connection };
