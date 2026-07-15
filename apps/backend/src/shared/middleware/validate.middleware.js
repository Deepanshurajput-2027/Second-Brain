import { z } from 'zod';
import { ApiError } from '../errors/ApiError.js';

/**
 * Express middleware to validate request data against a Zod schema.
 * Parses req.body, req.query, and req.params combined.
 * Throws a 400 ApiError on failure.
 * @param {z.ZodSchema} schema
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const combinedData = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    const validData = schema.parse(combinedData);

    // Reassign parsed data back to req.body (merging to preserve original structure if needed)
    req.body = { ...req.body, ...validData };

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => e.message).join(', ');
      throw new ApiError(400, `Validation Error: ${errorMessages}`);
    }
    next(error);
  }
};
