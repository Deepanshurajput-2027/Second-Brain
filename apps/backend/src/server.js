import 'dotenv/config';
import app from './app.js';
import connectDatabase from './config/database.config.js';
import { validateEnv } from './shared/validators/envValidator.js';
import logger from './utils/logger/logger.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  validateEnv();
  
  await connectDatabase();

  app.listen(PORT, () => {
    logger.info(`Backend server running on port ${PORT}`);
  });
};

startServer();
