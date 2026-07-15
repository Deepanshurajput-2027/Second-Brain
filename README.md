# Second Brain

Second Brain is an AI-powered knowledge management platform where users can save Articles, URLs, PDFs, Images, YouTube links, Markdown Notes, and Plain Text Notes. The platform automatically generates metadata, semantic embeddings, contextual tags, knowledge graph relationships, and enables semantic search.

## Architecture & Tech Stack

This project is structured as a TurboRepo Monorepo utilizing `pnpm`.

- **Frontend**: React, Vite, JavaScript, TailwindCSS, Redux Toolkit, React Router, TanStack Query, Axios. Deploys to Vercel.
- **Backend**: Node.js, Express, Mongoose, JWT, BullMQ, Zod. Deploys to Render.
- **AI Service**: Python, FastAPI, Sentence Transformers. Deploys to Render.
- **Database**: MongoDB Atlas, Qdrant (Vector DB), Upstash Redis (Queue/Cache).
- **Storage**: Cloudinary.

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Environment Variables**
   Copy `.env.example` to `.env` in `frontend/`, `backend/`, and `ai-service/` and configure accordingly.

3. **Start Development Servers**
   ```bash
   pnpm dev
   ```
   This will start the frontend, backend, and AI service concurrently.

## Folder Structure

- `/frontend` - React Vite Application
- `/backend` - Express API
- `/ai-service` - FastAPI Python Service
- `/shared` - Shared schemas, constants, and utilities
- `/docs` - Documentation and ADRs
