import { UserRepository } from './user.repository.js';
import { successResponse } from '../../shared/responses/apiResponse.js';
import ApiError from '../../shared/errors/ApiError.js';
import { HTTP_STATUS } from '../../shared/constants/appConstants.js';
import logger from '../../utils/logger/logger.js';

/**
 * Update the authenticated user's profile
 */
export const updateProfileHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const updatedUser = await UserRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found', 'USER_NOT_FOUND');
    }

    logger.info(`User ${userId} updated their profile`);
    return successResponse(res, HTTP_STATUS.OK, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};
