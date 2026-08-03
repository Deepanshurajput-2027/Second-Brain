import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { updateProfileSchema } from './user.validation.js';
import { updateProfileHandler } from './user.controller.js';

const router = Router();

// Secure all routes in this module
router.use(requireAuth);

router.put('/profile', validate(updateProfileSchema), updateProfileHandler);

export const userRoutes = router;
