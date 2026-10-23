import 'dotenv/config';
import app from './app.js';
import connectDatabase from './config/database.config.js';
import { validateEnv } from './shared/validators/envValidator.js';
import logger from './utils/logger/logger.js';
import { startWorkers } from './queues/index.js';
import { initQdrantCollections } from './database/qdrant.init.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    validateEnv();

    await connectDatabase();

    // Start accepting requests immediately — do NOT block on Qdrant
    app.listen(PORT, () => {
      logger.info(`Backend server running on port ${PORT}`);
    });

    // Start BullMQ background workers
    startWorkers();

    // Initialize Qdrant in background — non-blocking so the server is ready
    // for auth/API calls before Qdrant finishes its HTTP handshake
    initQdrantCollections().catch((err) => {
      logger.warn(`[Qdrant] Init failed (non-fatal, will retry on next restart): ${err.message}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();