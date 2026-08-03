import { z } from 'zod';
import { SOURCE_TYPES } from './knowledge.constants.js';

export const createKnowledgeSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    sourceType: z.enum(Object.values(SOURCE_TYPES), {
      errorMap: () => ({ message: 'Invalid source type' }),
    }),
    sourceUrl: z.string().url('Must be a valid URL').optional(),
    content: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.sourceType === SOURCE_TYPES.URL || data.sourceType === SOURCE_TYPES.YOUTUBE) {
        return !!data.sourceUrl;
      }
      return true;
    },
    {
      message: 'sourceUrl is required for URL and YOUTUBE source types',
      path: ['sourceUrl'],
    }
  )
  .refine(
    (data) => {
      if (data.sourceType === SOURCE_TYPES.TEXT || data.sourceType === SOURCE_TYPES.MARKDOWN) {
        return !!data.content;
      }
      return true;
    },
    {
      message: 'content is required for TEXT and MARKDOWN source types',
      path: ['content'],
    }
  );

export const updateKnowledgeSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});
