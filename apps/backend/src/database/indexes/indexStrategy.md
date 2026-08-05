# Database Index Strategy

This document outlines the standard indexing strategy for the Second Brain application. 
Every module schema should follow these guidelines.

## 1. Global Indexes
Due to the `softDeletePlugin` filtering queries globally via `isDeleted: { $ne: true }`, an index is necessary on `isDeleted` to ensure efficient global query exclusion.
- `{ isDeleted: 1 }` (Included globally in `baseSchemaDefinition`)

## 2. Common Query Indexes
For fields universally used for sorting and filtering across models:
- `{ createdAt: -1 }` (Typically used for default pagination sorting)
- `{ createdBy: 1 }` (Used for tenant/user isolation queries, filtering data by user)

## 3. Implementation Rules
- **Domain-Specific Indexes:** Domain-specific schemas (e.g., inside `modules/knowledge/`) should define their own compound and unique indexes locally inside their module, NOT here in the global database folder.
- **Background Indexing:** Indexes should be built in the background in production to avoid blocking the database during deployment.
- **Naming Convention:** Index names should be explicit and use `camelCase` when manually defined.

## Example Base Index Application

```javascript
// In domain schema (e.g. apps/backend/src/modules/knowledge/knowledge.schema.js):
import { createSchema } from '../../database/base/createSchema.js';

const knowledgeSchema = createSchema({
  title: { type: String, required: true },
  content: { type: String },
});

// Domain-specific indexing
knowledgeSchema.index({ createdBy: 1, createdAt: -1 }, { background: true });
knowledgeSchema.index({ title: 'text' }, { background: true });

export default knowledgeSchema;
```
