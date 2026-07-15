import { KnowledgeRepository } from './knowledge.repository.js';
import { ApiError } from '../../shared/errors/ApiError.js';

/**
 * Service orchestrating knowledge business logic and authorizations
 */
export class KnowledgeService {
  /**
   * Create a new knowledge item
   * @param {string} userId - The user creating the item
   * @param {Object} payload - The validated creation payload
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument>}
   */
  static async createItem(userId, payload) {
    const itemData = {
      ...payload,
      userId,
    };

    const createdItem = await KnowledgeRepository.createKnowledge(itemData);

    // TODO: Dispatch job to BullMQ AI Queue

    return createdItem;
  }

  /**
   * Get paginated items for a user
   * @param {string} userId - The user ID
   * @param {Object} queryOptions - Pagination and filtering options
   * @returns {Promise<Object>}
   */
  static async getUserItems(userId, queryOptions = {}) {
    return KnowledgeRepository.findUserKnowledge(userId, queryOptions);
  }

  /**
   * Get a specific knowledge item by ID, enforcing ownership
   * @param {string} userId - The user requesting the item
   * @param {string} itemId - The ID of the item
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument>}
   * @throws {ApiError} 404 if not found, 403 if unauthorized
   */
  static async getItemById(userId, itemId) {
    const item = await KnowledgeRepository.findKnowledgeById(itemId);

    if (!item) {
      throw new ApiError(404, 'Knowledge item not found');
    }

    if (item.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Forbidden: You do not have access to this item');
    }

    return item;
  }

  /**
   * Update a knowledge item
   * @param {string} userId - The user updating the item
   * @param {string} itemId - The ID of the item
   * @param {Object} updateData - Data to update
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument>}
   */
  static async updateItem(userId, itemId, updateData) {
    // 1. Verify existence and ownership
    await this.getItemById(userId, itemId);

    // 2. Proceed with update
    const updatedItem = await KnowledgeRepository.updateKnowledge(itemId, updateData);
    return updatedItem;
  }

  /**
   * Soft delete a knowledge item
   * @param {string} userId - The user deleting the item
   * @param {string} itemId - The ID of the item
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument>}
   */
  static async deleteItem(userId, itemId) {
    // 1. Verify existence and ownership
    await this.getItemById(userId, itemId);

    // 2. Proceed with soft delete
    const deletedItem = await KnowledgeRepository.softDeleteKnowledge(itemId);
    return deletedItem;
  }
}
