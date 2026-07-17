import { CollectionService } from './collection.service.js';
import { asyncHandler } from '../../utils/helpers/asyncHandler.js';
import { successResponse } from '../../shared/responses/apiResponse.js';

/**
 * Create a new collection
 */
export const createCollectionHandler = asyncHandler(async (req, res) => {
  const collection = await CollectionService.createCollection(req.user.id, req.body);
  return successResponse(res, 201, 'Collection created successfully', { collection });
});

/**
 * Retrieve all active collections for the authenticated user
 */
export const getCollectionsHandler = asyncHandler(async (req, res) => {
  const collections = await CollectionService.getUserCollections(req.user.id);
  return successResponse(res, 200, 'Collections retrieved successfully', { collections });
});

/**
 * Retrieve details for a single collection
 */
export const getCollectionByIdHandler = asyncHandler(async (req, res) => {
  const collection = await CollectionService.getCollectionById(req.user.id, req.params.id);
  return successResponse(res, 200, 'Collection retrieved successfully', { collection });
});

/**
 * Update a collection's details
 */
export const updateCollectionHandler = asyncHandler(async (req, res) => {
  const collection = await CollectionService.updateCollection(req.user.id, req.params.id, req.body);
  return successResponse(res, 200, 'Collection updated successfully', { collection });
});

/**
 * Soft delete a collection
 */
export const deleteCollectionHandler = asyncHandler(async (req, res) => {
  await CollectionService.deleteCollection(req.user.id, req.params.id);
  return successResponse(res, 200, 'Collection deleted successfully');
});

/**
 * Add a knowledge item to a collection
 */
export const addItemHandler = asyncHandler(async (req, res) => {
  const collection = await CollectionService.addItemToCollection(
    req.user.id,
    req.params.id,
    req.body.knowledgeId
  );
  return successResponse(res, 200, 'Knowledge item added to collection successfully', { collection });
});

/**
 * Remove a knowledge item from a collection
 */
export const removeItemHandler = asyncHandler(async (req, res) => {
  const collection = await CollectionService.removeItemFromCollection(
    req.user.id,
    req.params.id,
    req.params.knowledgeId
  );
  return successResponse(res, 200, 'Knowledge item removed from collection successfully', { collection });
});

/**
 * Get all populated knowledge items inside a collection
 */
export const getCollectionItemsHandler = asyncHandler(async (req, res) => {
  const items = await CollectionService.getCollectionItems(req.user.id, req.params.id);
  return successResponse(res, 200, 'Knowledge items retrieved successfully', { items });
});

/**
 * Return count of knowledge items inside a collection
 */
export const getCollectionItemsCountHandler = asyncHandler(async (req, res) => {
  const countObj = await CollectionService.getCollectionItemsCount(req.user.id, req.params.id);
  return successResponse(res, 200, 'Item count retrieved successfully', countObj);
});
