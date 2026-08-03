import express from 'express';
import { ingestMemory, getMemories, deleteMemory, semanticSearch, updateMemory, uploadMemory, getMemoryStatus } from './memory.controller.js';
import { upload } from '../../middleware/upload.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = express.Router();

// Secure all routes
router.use(requireAuth);

// GET /api/v1/memories/semantic-search
router.get('/semantic-search', semanticSearch);

// GET /api/v1/memories
router.get('/', getMemories);

// POST /api/v1/memories
router.post('/', ingestMemory);

// POST /api/v1/memories/upload
router.post('/upload', upload.single('file'), uploadMemory);

// DELETE /api/v1/memories/:id
router.delete('/:id', deleteMemory);

// GET /api/v1/memories/:id/status
router.get('/:id/status', getMemoryStatus);

// PUT /api/v1/memories/:id
router.put('/:id', updateMemory);

export { router as memoryRoutes };
