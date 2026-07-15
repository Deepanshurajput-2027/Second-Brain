/**
 * @file asyncHandler.js
 * @description Wrapper to catch unhandled promise rejections in Express controllers.
 */

/**
 * Wraps an async route handler to pass errors to Express Next() function.
 * @param {Function} requestHandler - The async Express controller function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
