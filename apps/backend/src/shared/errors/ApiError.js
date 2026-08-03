/**
 * @class ApiError
 * @description Custom error class for API errors.
 * @extends Error
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {string} [errorCode] - Specific internal error code
   * @param {Object} [details] - Additional error context or validation errors
   * @param {string} [stack] - Optional stack trace for overriding default
   */
  constructor(statusCode, message, errorCode = 'INTERNAL_ERROR', details = null, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
export default ApiError;
