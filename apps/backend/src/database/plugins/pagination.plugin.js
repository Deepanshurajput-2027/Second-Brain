/**
 * @file pagination.plugin.js
 * @description Mongoose plugin for standardized model pagination.
 */

export const paginationPlugin = (schema) => {
  /**
   * @param {Object} filter - Query filter
   * @param {Object} options - Pagination options
   * @param {number} [options.page=1] - Current page
   * @param {number} [options.limit=20] - Items per page
   * @param {Object} [options.sort={ createdAt: -1 }] - Sort configuration
   * @param {string} [options.populate] - Populate configuration
   * @returns {Promise<Object>} Paginated result
   */
  schema.statics.paginate = async function (filter = {}, options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 20;
    const sort = options.sort || { createdAt: -1 };
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsQuery = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      docsQuery = docsQuery.populate(options.populate);
    }

    const [totalResults, results] = await Promise.all([countPromise, docsQuery.exec()]);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  };
};

export default paginationPlugin;
