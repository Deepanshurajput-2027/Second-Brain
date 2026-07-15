/**
 * @file apiResponse.js
 * @description Standardized API response structure for the application.
 */

/**
 * Creates a standard successful API response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object|Array} [data=null] - Optional response payload
 * @returns {Object} JSON response
 */
export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
};

/**
 * Creates a standard error API response.
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} [errorDetails=null] - Optional structured error details
 * @returns {Object} JSON response
 */
export const errorResponse = (res, statusCode, message, errorDetails = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: errorDetails,
  });
};
