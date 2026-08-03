import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    sourceType: {
      type: String,
      default: 'webpage',
      enum: ['webpage', 'youtube', 'pdf', 'image', 'bookmark', 'link'],
    },
    summary: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      }
    ],
    aiStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    }
  },
  {
    timestamps: true,
  }
);

// Add text index for basic MongoDB text search (optional, as we rely on Qdrant)
memorySchema.index({ title: 'text', summary: 'text', tags: 'text' });

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
