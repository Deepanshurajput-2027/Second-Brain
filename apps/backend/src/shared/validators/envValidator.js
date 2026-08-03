/**
 * @file envValidator.js
 * @description Validates required environment variables on application startup.
 */
import { z } from 'zod';
import logger from '../../utils/logger/logger.js';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10).optional(),
  CLOUDINARY_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  QDRANT_URL: z.string().url(),
});

export const validateEnv = () => {
  try {
    envSchema.parse(process.env);
    logger.info('Environment variables validated successfully.');
  } catch (error) {
    logger.error('❌ Environment validation failed. Missing or invalid variables:');
    error.errors.forEach((err) => {
      logger.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
};
