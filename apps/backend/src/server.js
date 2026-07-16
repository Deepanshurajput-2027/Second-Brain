import 'dotenv/config';
import app from './app.js';
import connectDatabase from './config/database.config.js';
import { validateEnv } from './shared/validators/envValidator.js';
import logger from './utils/logger/logger.js';
import { startWorkers } from './queues/index.js'; 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    validateEnv();
    
    await connectDatabase();
    
    //Start the BullMQ background workers
    startWorkers(); 

    app.listen(PORT, () => {
      logger.info(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();