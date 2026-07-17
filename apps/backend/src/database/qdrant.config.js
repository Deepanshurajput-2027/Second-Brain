import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

// Ensure env vars are loaded if this is executed independently
dotenv.config();

const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;

if (!url) {
  console.warn('QDRANT_URL is not defined in the environment variables.');
}

const qdrantClient = new QdrantClient({
  url,
  apiKey,
});

export { qdrantClient };
