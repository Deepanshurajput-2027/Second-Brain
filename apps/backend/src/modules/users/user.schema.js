import mongoose from 'mongoose';
import { USER_ROLES, USER_VALIDATION, EMAIL_REGEX } from './user.constants.js';
import paginationPlugin from '../../database/plugins/pagination.plugin.js';
import softDeletePlugin from '../../database/plugins/softDelete.plugin.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [
        USER_VALIDATION.NAME_MIN_LENGTH,
        `Full name must be at least ${USER_VALIDATION.NAME_MIN_LENGTH} characters`,
      ],
      maxlength: [
        USER_VALIDATION.NAME_MAX_LENGTH,
        `Full name cannot exceed ${USER_VALIDATION.NAME_MAX_LENGTH} characters`,
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      minlength: [
        USER_VALIDATION.PASSWORD_MIN_LENGTH,
        `Password must be at least ${USER_VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      ],
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: '{VALUE} is not a valid role',
      },
      default: USER_ROLES.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
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
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Apply shared plugins
userSchema.plugin(paginationPlugin);
userSchema.plugin(softDeletePlugin);

// Compound indexes (email + isDeleted) to support unique emails while allowing soft-deleted users
userSchema.index({ email: 1, isDeleted: 1 });

/**
 * Pre-save hook placeholder for password hashing
 */
userSchema.pre('save', async function (next) {
  // if (!this.isModified('password')) return next();
  // this.password = await hashPassword(this.password);
  next();
});

/**
 * Instance methods placeholder
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // return comparePassword(candidatePassword, this.password);
  return false;
};

/**
 * Static methods placeholder
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

export const User = mongoose.model('User', userSchema);
