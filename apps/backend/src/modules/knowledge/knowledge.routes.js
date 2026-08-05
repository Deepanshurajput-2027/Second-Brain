import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createKnowledgeSchema, updateKnowledgeSchema } from './knowledge.validation.js';
import {
  createKnowledgeHandler,
  getKnowledgeHandler,
  getKnowledgeByIdHandler,
  updateKnowledgeHandler,
  deleteKnowledgeHandler,
  searchKnowledgeHandler,
  getRelatedKnowledgeHandler,
} from './knowledge.controller.js';

const router = Router();

// Secure all routes in this module
router.use(requireAuth);

router.post('/', validate(createKnowledgeSchema), createKnowledgeHandler);
router.get('/', getKnowledgeHandler);
router.get('/search', searchKnowledgeHandler);
router.get('/:id/related', getRelatedKnowledgeHandler);
router.get('/:id', getKnowledgeByIdHandler);
router.patch('/:id', validate(updateKnowledgeSchema), updateKnowledgeHandler);
router.delete('/:id', deleteKnowledgeHandler);

export const knowledgeRoutes = router;
