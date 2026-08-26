import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';
import Memory from './memory.model.js';
import mongoose from 'mongoose';
import { qdrantClient } from '../../database/qdrant.config.js';
import { uploadToCloudinary } from '../../utils/cloudinary.js';
import { aiQueue } from '../../queues/ai.queue.js';
import logger from '../../utils/logger/logger.js';
import { withExponentialBackoff } from '../../utils/retryPrompt.js';

// Initialize the Gemini client using the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const ingestMemory = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    let fallbackDomain = 'Saved Link';
    try {
      fallbackDomain = new URL(url).hostname;
    } catch (e) {
      logger.warn(`Failed to parse URL for fallback domain: ${e.message}`);
    }
    
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

    const newMemory = new Memory({
      user: req.user._id,
      url: url,
      title: fallbackDomain,
      sourceType: isYouTube ? 'youtube' : 'webpage',
      aiStatus: 'pending',
    });

    const savedMemory = await newMemory.save();

    await aiQueue.add('process-memory', {
      memoryId: savedMemory._id.toString(),
      userId: req.user._id.toString(),
      url: url,
      type: 'url'
    });

    return res.status(202).json({
      id: savedMemory._id.toString(),
      _id: savedMemory._id.toString(),
      url: savedMemory.url,
      title: savedMemory.title,
      sourceType: savedMemory.sourceType,
      aiStatus: savedMemory.aiStatus,
      createdAt: savedMemory.createdAt
    });

  } catch (error) {
    logger.error(`Error in ingestMemory: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error', errorDetails: error.message });
  }
};

export const getMemories = async (req, res) => {
  try {
    const memories = await Memory.find({ user: req.user._id }).sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const formatted = memories.map(m => ({
      id: m._id.toString(),
      _id: m._id.toString(),
      url: m.url,
      title: m.title,
      sourceType: m.sourceType,
      summary: m.summary,
      tags: m.tags,
      createdAt: m.createdAt
    }));
    return res.status(200).json(formatted);
  } catch (error) {
    logger.error(`Error fetching memories: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error fetching memories' });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const memory = await Memory.findOneAndDelete({ _id: id, user: req.user._id });
    
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found or you do not have permission to delete it' });
    }
    
    // Attempt to delete from Qdrant by finding payload
    try {
      await qdrantClient.delete('knowledge_vectors', {
        wait: true,
        filter: {
          must: [{ key: 'mongo_id', match: { value: id } }]
        }
      });
    } catch (qError) {
      logger.error(`Failed to delete from Qdrant: ${qError.message}`);
    }

    return res.status(200).json({ message: 'Memory deleted', id });
  } catch (error) {
    logger.error(`Error deleting memory: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error deleting memory' });
  }
};

export const semanticSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });

    const embeddingRes = await withExponentialBackoff(() => ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: q,
    }));
    const queryVector = embeddingRes.embeddings[0].values;

    const searchResults = await qdrantClient.query('knowledge_vectors', {
      query: queryVector,
      limit: 10,
      with_payload: true,
      score_threshold: 0.55, 
    });

    // Extract mongo_ids from the Qdrant payload
    const extractedIds = (searchResults.points || []).map(hit => hit.payload?.mongo_id).filter(Boolean);

    // Cast strings to mongoose ObjectIds to ensure the $in query works correctly
    const objectIds = extractedIds.map(id => new mongoose.Types.ObjectId(id));

    // Fetch the full documents from MongoDB, strictly scoped to the user
    const memories = await Memory.find({ _id: { $in: objectIds }, user: req.user._id });

    // Maintain Score Ordering: Map extractedIds back to the fetched memories to preserve Qdrant's descending score order
    const sortedMemories = extractedIds
      .map(id => memories.find(m => m._id.toString() === id))
      .filter(Boolean);

    // Format and enforce a strict limit of 10 items
    const formatted = sortedMemories.slice(0, 10).map(m => ({
      id: m._id.toString(),
      _id: m._id.toString(),
      url: m.url,
      title: m.title,
      sourceType: m.sourceType,
      summary: m.summary,
      tags: m.tags,
      createdAt: m.createdAt
    }));

    return res.status(200).json(formatted);

  } catch (error) {
    logger.error(`Error in semantic search: ${error.message}`);
    return res.status(503).json({ message: 'Semantic search service unavailable', errorDetails: error.message });
  }
};

export const updateMemory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tags, summary } = req.body;

    const memory = await Memory.findOne({ _id: id, user: req.user._id });
    if (!memory) return res.status(404).json({ message: 'Memory not found' });

    if (title !== undefined) memory.title = title;
    if (tags !== undefined) memory.tags = tags;
    if (summary !== undefined) memory.summary = summary;

    const updatedMemory = await memory.save();

    return res.status(200).json({
      id: updatedMemory._id.toString(),
      _id: updatedMemory._id.toString(),
      url: updatedMemory.url,
      title: updatedMemory.title,
      sourceType: updatedMemory.sourceType,
      summary: updatedMemory.summary,
      tags: updatedMemory.tags,
      createdAt: updatedMemory.createdAt
    });
  } catch (error) {
    logger.error(`Error updating memory: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error updating memory' });
  }
};

export const uploadMemory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, mimetype, originalname } = req.file;

    const cloudinaryResponse = await uploadToCloudinary(buffer);
    const secureUrl = cloudinaryResponse.secure_url;
    
    let sourceType = 'webpage';
    if (mimetype.includes('pdf')) sourceType = 'pdf';
    else if (mimetype.includes('image')) sourceType = 'image';
    else if (mimetype.includes('text')) sourceType = 'webpage';

    const newMemory = new Memory({
      user: req.user._id,
      url: secureUrl,
      title: originalname,
      sourceType: sourceType,
      aiStatus: 'pending'
    });

    const savedMemory = await newMemory.save();

    await aiQueue.add('process-memory', {
      memoryId: savedMemory._id.toString(),
      userId: req.user._id.toString(),
      url: secureUrl,
      mimetype,
      type: 'file'
    });

    return res.status(202).json({
      id: savedMemory._id.toString(),
      _id: savedMemory._id.toString(),
      url: savedMemory.url,
      title: savedMemory.title,
      sourceType: savedMemory.sourceType,
      aiStatus: savedMemory.aiStatus,
      createdAt: savedMemory.createdAt
    });

  } catch (error) {
    logger.error(`Upload failed: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error processing file', errorDetails: error.message });
  }
};

export const getMemoryStatus = async (req, res) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, user: req.user._id });
    if (!memory) return res.status(404).json({ message: 'Memory not found' });
    
    return res.status(200).json({
      _id: memory._id.toString(),
      id: memory._id.toString(),
      aiStatus: memory.aiStatus
    });
  } catch (error) {
    logger.error(`Error getting memory status: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

