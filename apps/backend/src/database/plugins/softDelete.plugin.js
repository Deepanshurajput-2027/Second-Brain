/**
 * @file softDelete.plugin.js
 * @description Mongoose plugin to handle soft deletion of documents globally.
 */

export const softDeletePlugin = (schema) => {
  // Ensure soft delete fields exist on any schema using this plugin
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.methods.softDelete = async function (userId = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (userId) this.updatedBy = userId;
    return this.save();
  };

  schema.methods.restore = async function (userId = null) {
    this.isDeleted = false;
    this.deletedAt = null;
    if (userId) this.updatedBy = userId;
    return this.save();
  };

  schema.statics.softDelete = async function (filter, userId = null) {
    return this.findOneAndUpdate(
      filter,
      { isDeleted: true, deletedAt: new Date(), ...(userId && { updatedBy: userId }) },
      { new: true }
    ).exec();
  };

  schema.statics.restore = async function (filter, userId = null) {
    return this.findOneAndUpdate(
      filter,
      { isDeleted: false, deletedAt: null, ...(userId && { updatedBy: userId }) },
      { new: true }
    ).exec();
  };

  // Exclude soft-deleted documents from standard queries
  const excludeDeleted = function (next) {
    if (this.getFilter().isDeleted !== true && this.getFilter().isDeleted !== false) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);
};

export default softDeletePlugin;
