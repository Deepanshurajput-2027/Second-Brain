import { KnowledgeService } from './knowledge.service.js';
import { KnowledgeRepository } from './knowledge.repository.js';
import { asyncHandler } from '../../utils/helpers/asyncHandler.js';
import { successResponse } from '../../shared/responses/apiResponse.js';
import axios from 'axios';
import { qdrantClient } from '../../database/qdrant.config.js';

/**
 * Create a new knowledge item
 */
export const createKnowledgeHandler = asyncHandler(async (req, res) => {
  const item = await KnowledgeService.createItem(req.user.id, req.body);
  return successResponse(res, 201, 'Knowledge item created successfully', { item });
});

/**
 * Get paginated knowledge items for the authenticated user
 */
export const getKnowledgeHandler = asyncHandler(async (req, res) => {
  const items = await KnowledgeService.getUserItems(req.user.id, req.query);
  // Assuming the service returns { docs, totalDocs, limit, page, totalPages... }
  return successResponse(res, 200, 'Knowledge items retrieved successfully', items);
});

/**
 * Get a specific knowledge item by ID
 */
export const getKnowledgeByIdHandler = asyncHandler(async (req, res) => {
  const item = await KnowledgeService.getItemById(req.user.id, req.params.id);
  return successResponse(res, 200, 'Knowledge item retrieved successfully', { item });
});

/**
 * Update a specific knowledge item by ID
 */
export const updateKnowledgeHandler = asyncHandler(async (req, res) => {
  const item = await KnowledgeService.updateItem(req.user.id, req.params.id, req.body);
  return successResponse(res, 200, 'Knowledge item updated successfully', { item });
});

/**
 * Delete a specific knowledge item by ID
 */
export const deleteKnowledgeHandler = asyncHandler(async (req, res) => {
  await KnowledgeService.deleteItem(req.user.id, req.params.id);
  return successResponse(res, 200, 'Knowledge item deleted successfully');
});

/**
 * Perform a semantic search on the user's knowledge base
 */
export const searchKnowledgeHandler = asyncHandler(async (req, res) => {
  const { q } = req.query;
  // Fallback to _id just in case your auth middleware binds it differently
  const userId = req.user.id || req.user._id;

  if (!q) {
    return res.status(400).json({ success: false, message: 'Search query "q" is required' });
  }

  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

  // 1. Vectorize the Search Query
  const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/process`, { text: q }, { timeout: 10000 });
  let { embedding } = aiResponse.data;

  // 🛡️ FIX: Flatten the embedding if Python returned a 2D array (e.g., [[0.1, 0.2]])
  if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
    embedding = embedding[0];
  }

  // 2. Query Qdrant for Nearest Neighbors
  let qdrantResults;
  try {
    qdrantResults = await qdrantClient.query('knowledge_vectors', {
      query: embedding,
      limit: 5,
      filter: {
        must: [
          { key: 'userId', match: { value: String(userId) } }
        ]
      }
    });
  } catch (error) {
    console.error("--- QDRANT REJECTED SEARCH ---", error);
    return res.status(500).json({
      success: false,
      message: 'Vector database rejected the search query.',
      details: error.message
    });
  }

  // Extract the original MongoDB ObjectIDs from the Qdrant payload
  const knowledgeIds = (qdrantResults.points || []).map(item => item.payload.knowledgeId);

  // 3. Hydrate from MongoDB
  let populatedDocs = [];
  if (knowledgeIds.length > 0) {
    populatedDocs = await KnowledgeRepository.find({ _id: { $in: knowledgeIds } });

    // Sort populated docs based on Qdrant result score/order
    const orderMap = new Map(knowledgeIds.map((id, index) => [String(id), index]));
    populatedDocs.sort((a, b) => orderMap.get(String(a._id)) - orderMap.get(String(b._id)));
  }

  return successResponse(res, 200, 'Semantic search completed successfully', { items: populatedDocs });
});

/**
 * Find related/clustered knowledge items
 */
export const getRelatedKnowledgeHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user._id;

  // 1. Fetch the source document
  const sourceDoc = await KnowledgeRepository.findKnowledgeById(id);
  
  if (!sourceDoc) {
    return res.status(404).json({ success: false, message: 'Source knowledge item not found' });
  }
  
  if (String(sourceDoc.userId) !== String(userId)) {
    return res.status(403).json({ success: false, message: 'Unauthorized access to this knowledge item' });
  }

  const embedding = sourceDoc.metadata?.embedding;
  if (!embedding || embedding.length === 0) {
    return successResponse(res, 200, 'No related items found (missing embedding)', { items: [] });
  }

  // 2. Query Qdrant for Clustered Neighbors
  let qdrantResults;
  try {
    qdrantResults = await qdrantClient.query('knowledge_vectors', {
      query: embedding,
      limit: 3,
      filter: {
        must: [
          { key: 'userId', match: { value: String(userId) } }
        ],
        must_not: [
          { key: 'knowledgeId', match: { value: String(id) } }
        ]
      }
    });
  } catch (error) {
    console.error("--- QDRANT REJECTED SEARCH ---", error);
    return res.status(500).json({
      success: false,
      message: 'Vector database rejected the search query.',
      details: error.message
    });
  }

  const knowledgeIds = (qdrantResults.points || []).map(item => item.payload.knowledgeId);

  // 3. Hydrate from MongoDB
  let populatedDocs = [];
  if (knowledgeIds.length > 0) {
    populatedDocs = await KnowledgeRepository.find({ _id: { $in: knowledgeIds } });

    const orderMap = new Map(knowledgeIds.map((kid, index) => [String(kid), index]));
    populatedDocs.sort((a, b) => orderMap.get(String(a._id)) - orderMap.get(String(b._id)));
  }

  return successResponse(res, 200, 'Related knowledge items retrieved successfully', { items: populatedDocs });
});