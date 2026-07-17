import { CollectionRepository } from './collection.repository.js';
import { KnowledgeRepository } from '../knowledge/knowledge.repository.js';
import { ApiError } from '../../shared/errors/ApiError.js';

/**
 * Service orchestrating collection business logic, uniqueness checks, and authorizations
 */
export class CollectionService {
  /**
   * Create a new collection for a user
   * @param {string} userId - ID of user creating the collection
   * @param {Object} payload - Create collection payload
   */
  static async createCollection(userId, payload) {
    const existing = await CollectionRepository.findByNameAndUser(userId, payload.name);
    if (existing) {
      throw new ApiError(409, 'Collection name already exists');
    }

    return CollectionRepository.createCollection({
      ...payload,
      userId,
      createdBy: userId,
    });
  }

  /**
   * Get all active collections belonging to a user
   * @param {string} userId - The user ID
   */
  static async getUserCollections(userId) {
    return CollectionRepository.findUserCollections(userId);
  }

  /**
   * Get collection details by ID, enforcing user ownership
   * @param {string} userId - The requesting user ID
   * @param {string} collectionId - The collection ID
   */
  static async getCollectionById(userId, collectionId) {
    const collection = await CollectionRepository.findCollectionById(collectionId);
    if (!collection || collection.isDeleted) {
      throw new ApiError(404, 'Collection not found');
    }

    if (collection.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Forbidden: You do not have access to this collection');
    }

    return collection;
  }

  /**
   * Update collection fields
   * @param {string} userId - The user updating the collection
   * @param {string} collectionId - The collection ID
   * @param {Object} payload - Fields to update
   */
  static async updateCollection(userId, collectionId, payload) {
    await this.getCollectionById(userId, collectionId);

    if (payload.name) {
      const existing = await CollectionRepository.findByNameAndUser(userId, payload.name);
      if (existing && existing._id.toString() !== collectionId.toString()) {
        throw new ApiError(409, 'Collection name already exists');
      }
    }

    return CollectionRepository.updateCollection(collectionId, {
      ...payload,
      updatedBy: userId,
    });
  }

  /**
   * Soft delete a collection
   * @param {string} userId - The user deleting the collection
   * @param {string} collectionId - The collection ID
   */
  static async deleteCollection(userId, collectionId) {
    await this.getCollectionById(userId, collectionId);
    return CollectionRepository.softDeleteCollection(collectionId);
  }

  /**
   * Add a knowledge item to a collection
   * @param {string} userId - User ID
   * @param {string} collectionId - Collection ID
   * @param {string} knowledgeId - Knowledge item ID
   */
  static async addItemToCollection(userId, collectionId, knowledgeId) {
    const collection = await this.getCollectionById(userId, collectionId);

    // Verify knowledge item exists and belongs to this user
    const item = await KnowledgeRepository.findKnowledgeById(knowledgeId);
    if (!item || item.isDeleted) {
      throw new ApiError(404, 'Knowledge item not found');
    }

    if (item.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Forbidden: You do not have access to this knowledge item');
    }

    // Add item if not already present
    const exists = collection.knowledgeItems.some(
      (itemId) => itemId.toString() === knowledgeId.toString()
    );

    if (exists) {
      return collection;
    }

    collection.knowledgeItems.push(knowledgeId);
    collection.updatedBy = userId;
    return collection.save();
  }

  /**
   * Remove a knowledge item from a collection
   * @param {string} userId - User ID
   * @param {string} collectionId - Collection ID
   * @param {string} knowledgeId - Knowledge item ID
   */
  static async removeItemFromCollection(userId, collectionId, knowledgeId) {
    const collection = await this.getCollectionById(userId, collectionId);

    const initialLength = collection.knowledgeItems.length;
    collection.knowledgeItems = collection.knowledgeItems.filter(
      (itemId) => itemId.toString() !== knowledgeId.toString()
    );

    if (collection.knowledgeItems.length === initialLength) {
      return collection;
    }

    collection.updatedBy = userId;
    return collection.save();
  }

  /**
   * Get all populated knowledge items inside a collection
   * @param {string} userId - User ID
   * @param {string} collectionId - Collection ID
   */
  static async getCollectionItems(userId, collectionId) {
    const collection = await this.getCollectionById(userId, collectionId);
    await collection.populate({
      path: 'knowledgeItems',
      match: { isDeleted: { $ne: true } },
    });
    return collection.knowledgeItems;
  }

  /**
   * Get count of knowledge items inside a collection
   * @param {string} userId - User ID
   * @param {string} collectionId - Collection ID
   */
  static async getCollectionItemsCount(userId, collectionId) {
    const collection = await this.getCollectionById(userId, collectionId);
    return { count: collection.knowledgeItems.length };
  }
}
