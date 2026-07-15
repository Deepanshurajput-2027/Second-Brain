import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { registerHandler, loginHandler, refreshHandler, logoutHandler } from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

export const authRoutes = router;
