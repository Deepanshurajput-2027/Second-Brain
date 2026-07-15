/**
 * @file createSchema.js
 * @description Helper to create Mongoose schemas with base definitions and plugins automatically applied.
 */
import { Schema } from 'mongoose';
import { baseSchemaDefinition, baseSchemaOptions } from './baseSchema.js';
import { softDeletePlugin } from '../plugins/softDelete.plugin.js';
import { paginationPlugin } from '../plugins/pagination.plugin.js';

/**
 * Creates a standard Mongoose schema integrating the base fields and plugins.
 * Every domain module should use this to create their schemas.
 * 
 * @param {Object} schemaDefinition - Domain specific schema fields
 * @param {Object} [schemaOptions={}] - Domain specific schema options
 * @returns {Schema} Constructed Mongoose Schema
 */
export const createSchema = (schemaDefinition, schemaOptions = {}) => {
  const finalDefinition = {
    ...baseSchemaDefinition,
    ...schemaDefinition,
  };

  const finalOptions = {
    ...baseSchemaOptions,
    ...schemaOptions,
  };

  const schema = new Schema(finalDefinition, finalOptions);

  // Apply global plugins
  schema.plugin(softDeletePlugin);
  schema.plugin(paginationPlugin);

  return schema;
};
