import mongoose from 'mongoose';
import paginationPlugin from '../../database/plugins/pagination.plugin.js';
import softDeletePlugin from '../../database/plugins/softDelete.plugin.js';

const { Schema } = mongoose;

const collectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      minlength: [1, 'Collection name cannot be empty'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      default: '#22c55e', // default green accent
    },
    icon: {
      type: String,
      default: 'folder', // default icon name
    },
    knowledgeItems: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Memory',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Apply shared plugins
collectionSchema.plugin(paginationPlugin);
collectionSchema.plugin(softDeletePlugin);

// Compound index optimized for user-specific collections query
collectionSchema.index({ userId: 1, isDeleted: 1 });

export const Collection = mongoose.model('Collection', collectionSchema);
