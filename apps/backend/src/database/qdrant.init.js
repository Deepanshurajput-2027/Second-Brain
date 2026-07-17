import { qdrantClient } from './qdrant.config.js';
import logger from '../utils/logger/logger.js';

const COLLECTION_NAME = 'knowledge_vectors';

export async function initQdrantCollections() {
  try {
    logger.info(`Checking if Qdrant collection '${COLLECTION_NAME}' exists...`);
    
    // Retrieve list of existing collections
    const response = await qdrantClient.getCollections();
    const collections = response.collections.map(col => col.name);
    
    if (!collections.includes(COLLECTION_NAME)) {
      logger.info(`Collection '${COLLECTION_NAME}' not found. Creating...`);
      
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384, // Matching HuggingFace all-MiniLM-L6-v2 output dimensions
          distance: 'Cosine',
        },
      });
      
      logger.info(`Successfully created Qdrant collection '${COLLECTION_NAME}'.`);
    } else {
      logger.info(`Qdrant collection '${COLLECTION_NAME}' already exists.`);
    }
  } catch (error) {
    logger.error(`Failed to initialize Qdrant collections: ${error.message}`);
    // Not throwing the error to prevent application crash on network issues during boot
  }
}
