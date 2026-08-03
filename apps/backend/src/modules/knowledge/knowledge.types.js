/**
 * @typedef {Object} KnowledgeDocument
 * @property {string|import('mongoose').Types.ObjectId} userId - Reference to the user who owns this knowledge
 * @property {string} title - The title of the knowledge item
 * @property {string} sourceType - The type of source (URL, YOUTUBE, PDF, IMAGE, TEXT, MARKDOWN)
 * @property {string} [sourceUrl] - The original URL or cloud storage link
 * @property {string} [content] - Extracted text or markdown content
 * @property {string[]} tags - Array of categorizing tags
 * @property {string} aiStatus - Current AI processing status
 * @property {Object} [metadata] - Flexible metadata object (e.g., duration, author, page count)
 * @property {Date} createdAt - Timestamp of creation
 * @property {Date} updatedAt - Timestamp of last update
 * @property {boolean} isDeleted - Flag indicating if soft-deleted
 * @property {Date} [deletedAt] - Timestamp of soft deletion
 */

// This file is purely for JSDoc typings and does not export runtime values.
export {};
