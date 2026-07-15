import { KnowledgeService } from './knowledge.service.js';
import { asyncHandler } from '../../utils/helpers/asyncHandler.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

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
