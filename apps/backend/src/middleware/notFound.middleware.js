/**
 * @file notFound.middleware.js
 * @description Handles 404 responses for unknown routes.
 */
import { HTTP_STATUS } from '../shared/constants/appConstants.js';
import ApiError from '../shared/errors/ApiError.js';

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND, 
    `Resource Not Found - ${req.originalUrl}`, 
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

export default notFoundHandler;
