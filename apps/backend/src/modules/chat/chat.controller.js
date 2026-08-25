import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import { qdrantClient } from '../../database/qdrant.config.js';
import Memory from '../memory/memory.model.js';
import logger from '../../utils/logger/logger.js';
import { withExponentialBackoff } from '../../utils/retryPrompt.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const chatWithBrain = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Step 1: Embed the user's message
    const embeddingRes = await withExponentialBackoff(() => ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: message,
    }));
    const queryVector = embeddingRes.embeddings[0].values;

    // Step 2: Query Qdrant for top relevant memory chunks
    const searchResults = await qdrantClient.query('knowledge_vectors', {
      query: queryVector,
      limit: 5,
    });

    if (!searchResults || searchResults.length === 0) {
      return res.status(200).json({ 
        role: 'ai', 
        content: "I couldn't find any relevant memories in your Second Brain to answer that question." 
      });
    }

    // Step 3: Fetch full metadata from MongoDB
    const memoryIds = searchResults.map(result => result.payload.mongo_id);
    const memories = await Memory.find({ _id: { $in: memoryIds } });

    // Combine memory summaries into context string
    const context = memories.map(m => `Title: ${m.title}\nSummary: ${m.summary}\nTags: ${m.tags?.join(', ')}`).join('\n\n');

    // Step 4: Construct strict prompt for Gemini
    const prompt = `
You are the AI assistant for a user's "Second Brain". The user is asking you a question about the information they have saved.
You must answer the user's question STRICTLY using ONLY the provided memory contexts below. 
If the provided contexts do not contain enough information to answer the question, state that clearly and do not hallucinate an answer.

Here are the relevant memories retrieved from their database:
-------------------------
${context}
-------------------------

User's Question: ${message}
`;

    // Step 5: Generate response
    let response;
    try {
      response = await withExponentialBackoff(() => ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      }));
    } catch (err) {
      const status = err.status || err.response?.status || err?.error?.code;
      if (status === 503 || status === 429) {
        return res.status(status).json({
          message: "AI service is experiencing high traffic."
        });
      }
      throw err;
    }

    return res.status(200).json({ 
      role: 'ai', 
      content: response.text 
    });

  } catch (error) {
    logger.error(`Chat error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error processing chat', errorDetails: error.message });
  }
};
