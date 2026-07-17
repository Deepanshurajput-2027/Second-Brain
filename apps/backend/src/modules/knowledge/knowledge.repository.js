import { Knowledge } from './knowledge.schema.js';

/**
 * Repository handling database operations for the Knowledge domain
 */
export class KnowledgeRepository {
  /**
   * Create a new knowledge item
   * @param {Object} data - The knowledge data
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument>}
   */
  static async createKnowledge(data) {
    const knowledge = new Knowledge(data);
    return knowledge.save();
  }

  /**
   * Find a knowledge item by ID
   * @param {string} id - The knowledge item ID
   * @param {Object} [projection] - Optional fields to include/exclude
   * @param {Object} [options] - Additional query options
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument|null>}
   */
  static async findKnowledgeById(id, projection = {}, options = {}) {
    return Knowledge.findById(id, projection, options).exec();
  }

  /**
   * Find paginated knowledge items for a specific user
   * @param {string} userId - The user ID
   * @param {Object} [queryOptions] - Options for pagination (page, limit, sort, etc.)
   * @param {Object} [projection] - Optional fields to include/exclude
   * @returns {Promise<Object>} The paginated result
   */
  static async findUserKnowledge(userId, queryOptions = {}, projection = {}) {
    const query = { userId };
    // Assuming paginationPlugin exposes a paginate method on the model
    return Knowledge.paginate(query, { ...queryOptions, select: projection });
  }

  /**
   * Update a knowledge item
   * @param {string} id - The knowledge item ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument|null>}
   */
  static async updateKnowledge(id, updateData) {
    return Knowledge.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  /**
   * Soft delete a knowledge item
   * @param {string} id - The knowledge item ID
   * @returns {Promise<import('./knowledge.types.js').KnowledgeDocument|null>}
   */
  static async softDeleteKnowledge(id) {
    // Assuming softDeletePlugin exposes a `softDelete` method
    return Knowledge.softDelete({ _id: id });
  }

  /**
   * Find knowledge items based on a query
   * @param {Object} query - The query object
   * @returns {Promise<Array<import('./knowledge.types.js').KnowledgeDocument>>}
   */
  static async find(query) {
    return Knowledge.find(query).exec();
  }
}
