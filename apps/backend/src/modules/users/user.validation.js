import { z } from 'zod';
import { USER_VALIDATION } from './user.constants.js';

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(USER_VALIDATION.NAME_MIN_LENGTH, `Full name must be at least ${USER_VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(USER_VALIDATION.NAME_MAX_LENGTH, `Full name cannot exceed ${USER_VALIDATION.NAME_MAX_LENGTH} characters`)
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
});
