import express from 'express';
import { chatWithBrain } from './chat.controller.js';

const router = express.Router();

// POST /api/v1/chat
router.post('/', chatWithBrain);

export { router as chatRoutes };
