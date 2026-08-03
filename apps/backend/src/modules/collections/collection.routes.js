import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import {
  createCollectionSchema,
  updateCollectionSchema,
  getCollectionSchema,
  addCollectionItemSchema,
  removeCollectionItemSchema,
} from './collection.validation.js';
import {
  createCollectionHandler,
  getCollectionsHandler,
  getCollectionByIdHandler,
  updateCollectionHandler,
  deleteCollectionHandler,
  addItemHandler,
  removeItemHandler,
  getCollectionItemsHandler,
  getCollectionItemsCountHandler,
} from './collection.controller.js';

const router = Router();

// Secure all routes in this module
router.use(requireAuth);

router.post('/', validate(createCollectionSchema), createCollectionHandler);
router.get('/', getCollectionsHandler);

router.get('/:id', validate(getCollectionSchema), getCollectionByIdHandler);
router.patch('/:id', validate(updateCollectionSchema), updateCollectionHandler);
router.delete('/:id', validate(getCollectionSchema), deleteCollectionHandler);

router.post('/:id/items', validate(addCollectionItemSchema), addItemHandler);
router.delete('/:id/items/:knowledgeId', validate(removeCollectionItemSchema), removeItemHandler);
router.get('/:id/items', validate(getCollectionSchema), getCollectionItemsHandler);
router.get('/:id/count', validate(getCollectionSchema), getCollectionItemsCountHandler);

export const collectionsRoutes = router;
