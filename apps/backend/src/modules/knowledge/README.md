# Knowledge Module

The **Knowledge Module** encapsulates the domain model and database operations for all user-saved content in the application.

## Unified Model

We utilize a unified document model to store diverse information sources (URLs, Youtube videos, PDFs, Images, and raw Markdown/Text) within a single `Knowledge` collection.

This design allows:

- A single, paginated query to fetch a user's entire knowledge base regardless of the source type.
- Unified tagging and AI processing statuses (`aiStatus`) across all items.
- Flexible, type-specific data storage via the `metadata` (Mixed) property.

## Responsibilities

- **Domain Entity**: Defines the Mongoose Schema (`knowledge.schema.js`), enums, and indexes.
- **Database Operations**: Exposes the `KnowledgeRepository` to handle standard data-access layer (DAL) needs.
- **Typings**: Centralizes JSDoc typedefs (`knowledge.types.js`) for module-wide IntelliSense.

## What it DOES NOT DO

- **No Controllers/Routes**: This module strictly avoids Express HTTP handling.
- **No Business/AI Logic**: The orchestration of scraping, OCR, transcription, and embedding is handled by specialized service layers outside of this repository structure.
