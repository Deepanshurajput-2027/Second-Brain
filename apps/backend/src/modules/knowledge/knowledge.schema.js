import mongoose from 'mongoose';
import { SOURCE_TYPES, AI_STATUS } from './knowledge.constants.js';
import paginationPlugin from '../../database/plugins/pagination.plugin.js';
import softDeletePlugin from '../../database/plugins/softDelete.plugin.js';

const { Schema } = mongoose;

const knowledgeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: Object.values(SOURCE_TYPES),
      required: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    aiStatus: {
      type: String,
      enum: Object.values(AI_STATUS),
      default: AI_STATUS.PENDING,
    },
    metadata: {
      embedding: {
        type: [Number],
        default: null,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Apply shared plugins
knowledgeSchema.plugin(paginationPlugin);
knowledgeSchema.plugin(softDeletePlugin);

// Compound index optimized for user-specific dashboard queries
knowledgeSchema.index({ userId: 1, isDeleted: 1 });

export const Knowledge = mongoose.model('Knowledge', knowledgeSchema);