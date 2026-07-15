/**
 * @file error.middleware.js
 * @description Global error handler middleware mapping exceptions to standard API responses.
 */
import { errorResponse } from '../shared/responses/apiResponse.js';
import ApiError from '../shared/errors/ApiError.js';
import { HTTP_STATUS } from '../shared/constants/appConstants.js';
import logger from '../utils/logger/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, 'UNKNOWN_ERROR', null, err.stack);
  }

  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(HTTP_STATUS.NOT_FOUND, message, 'RESOURCE_NOT_FOUND');
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(HTTP_STATUS.CONFLICT, message, 'DUPLICATE_RESOURCE');
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, message, 'VALIDATION_ERROR', err.errors);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, message, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired. Please log in again.';
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, message, 'TOKEN_EXPIRED');
  }

  logger.error(`[${req.method}] ${req.originalUrl} >> StatusCode:: ${error.statusCode}, Message:: ${error.message}`);

  const isDev = process.env.NODE_ENV === 'development';
  const errorDetails = {
    code: error.errorCode,
    details: error.details,
    ...(isDev && { stack: error.stack })
  };

  errorResponse(res, error.statusCode, error.message, errorDetails);
};

export default errorHandler;
