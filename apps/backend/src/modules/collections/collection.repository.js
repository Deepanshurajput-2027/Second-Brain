import { Collection } from './collection.schema.js';

/**
 * Repository handling database operations for the Collection domain
 */
export class CollectionRepository {
  /**
   * Create a new collection
   * @param {Object} data - The collection data
   * @returns {Promise<Object>}
   */
  static async createCollection(data) {
    const collection = new Collection(data);
    return collection.save();
  }

  /**
   * Find a collection by ID (even if deleted, or active)
   * @param {string} id - The collection ID
   * @returns {Promise<Object|null>}
   */
  static async findCollectionById(id) {
    return Collection.findById(id).exec();
  }

  /**
   * Find all active collections for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>}
   */
  static async findUserCollections(userId) {
    // Queries will automatically filter out isDeleted: true due to softDeletePlugin pre-find hook
    return Collection.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Find an active collection by name for a specific user
   * @param {string} userId - The user ID
   * @param {string} name - The collection name
   * @returns {Promise<Object|null>}
   */
  static async findByNameAndUser(userId, name) {
    return Collection.findOne({ userId, name }).exec();
  }

  /**
   * Update a collection by ID
   * @param {string} id - The collection ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>}
   */
  static async updateCollection(id, updateData) {
    return Collection.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  /**
   * Soft delete a collection
   * @param {string} id - The collection ID
   * @param {string} [userId=null] - The user ID performing deletion
   * @returns {Promise<Object|null>}
   */
  static async softDeleteCollection(id, userId = null) {
    return Collection.softDelete({ _id: id }, userId);
  }
}
