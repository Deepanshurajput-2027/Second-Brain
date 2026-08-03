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
          size: 3072, // Updated for gemini-embedding-2 dimensions
          distance: 'Cosine',
        },
      });

      // Instruct Qdrant to index the userId field for lightning-fast filtering
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'userId',
        field_schema: 'keyword',
        wait: true,
      });

      // 🔥 NEW: Instruct Qdrant to index the knowledgeId field for lightning-fast exclusions
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'knowledgeId',
        field_schema: 'keyword',
        wait: true,
      });

      logger.info(`Successfully created Qdrant collection '${COLLECTION_NAME}' with userId and knowledgeId indexes.`);
    } else {
      logger.info(`Qdrant collection '${COLLECTION_NAME}' already exists.`);
    }
  } catch (error) {
    logger.error(`Failed to initialize Qdrant collections: ${error.message}`);
  }
}