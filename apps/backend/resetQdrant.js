import * as dotenv from 'dotenv';
dotenv.config();

import { qdrantClient } from './src/database/qdrant.config.js';

const resetQdrant = async () => {
  try {
    console.log('Connecting to Qdrant...');
    
    // Check if collection exists and delete it
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === 'knowledge_vectors');
    
    if (exists) {
      console.log('Deleting existing collection: knowledge_vectors');
      await qdrantClient.deleteCollection('knowledge_vectors');
    }

    console.log('Creating new collection with dim: 3072, metric: Cosine');
    await qdrantClient.createCollection('knowledge_vectors', {
      vectors: {
        size: 3072,
        distance: 'Cosine',
      },
    });

    console.log('✅ Successfully reset Qdrant collection!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to reset Qdrant collection:', error);
    process.exit(1);
  }
};

resetQdrant();
