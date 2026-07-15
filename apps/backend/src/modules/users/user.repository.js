import { User } from './user.schema.js';

/**
 * User Repository
 * Encapsulates database operations for the User domain.
 */
export class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Find a user by ID
   * @param {string} id
   * @param {Object} [projection]
   * @returns {Promise<Object|null>}
   */
  static async findById(id, projection = {}) {
    return User.findById(id, projection).exec();
  }

  /**
   * Find a single user by query
   * @param {Object} query
   * @param {Object} [projection]
   * @returns {Promise<Object|null>}
   */
  static async findOne(query, projection = {}) {
    return User.findOne(query, projection).exec();
  }

  /**
   * Find a user by email
   * @param {string} email
   * @param {Object} [projection]
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email, projection = {}) {
    return User.findOne({ email }, projection).exec();
  }

  /**
   * Find users by query
   * @param {Object} query
   * @param {Object} [projection]
   * @returns {Promise<Array>}
   */
  static async find(query = {}, projection = {}) {
    return User.find(query, projection).exec();
  }

  /**
   * Update a user by ID
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object|null>}
   */
  static async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  /**
   * Soft delete a user by ID
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async softDelete(id) {
    // Assuming softDeletePlugin exposes a `softDelete` method
    return User.softDelete({ _id: id });
  }

  /**
   * Restore a soft-deleted user
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async restore(id) {
    // Assuming softDeletePlugin exposes a `restore` method
    return User.restore({ _id: id });
  }

  /**
   * Check if a user exists
   * @param {Object} query
   * @returns {Promise<boolean>}
   */
  static async exists(query) {
    const result = await User.exists(query);
    return result !== null;
  }

  /**
   * Count users
   * @param {Object} query
   * @returns {Promise<number>}
   */
  static async count(query = {}) {
    return User.countDocuments(query).exec();
  }

  /**
   * Paginate users
   * @param {Object} query
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  static async paginate(query = {}, options = {}) {
    // Assuming paginationPlugin exposes a `paginate` method
    return User.paginate(query, options);
  }
}
