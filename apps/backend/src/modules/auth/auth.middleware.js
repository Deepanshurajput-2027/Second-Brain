import { asyncHandler } from '../../utils/helpers/asyncHandler.js';
import { ApiError } from '../../shared/errors/ApiError.js';
import { JwtService } from './jwt.service.js';

/**
 * Express middleware to protect routes requiring authentication
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  // verifyAccessToken throws an ApiError if invalid or expired
  const decoded = JwtService.verifyAccessToken(token);

  // Attach user identity to request object
  req.user = {
    id: decoded.sub,
    role: decoded.role,
  };

  next();
});
