import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCollectionSchema = z.object({
  id: objectIdSchema,
  name: z.string().min(1, 'Collection name cannot be empty').optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const getCollectionSchema = z.object({
  id: objectIdSchema,
});

export const addCollectionItemSchema = z.object({
  id: objectIdSchema,
  knowledgeId: objectIdSchema,
});

export const removeCollectionItemSchema = z.object({
  id: objectIdSchema,
  knowledgeId: objectIdSchema,
});
