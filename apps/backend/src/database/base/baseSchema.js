import { Schema } from 'mongoose';

/**
 * Base schema definition for all domain models.
 * Includes tracking fields and soft delete fields.
 */
export const baseSchemaDefinition = {
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Nullable for system-created docs
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
};

/**
 * Base schema options enforcing timestamps.
 */
export const baseSchemaOptions = {
  timestamps: true, // Automatically adds createdAt and updatedAt
  strictQuery: true,
};
