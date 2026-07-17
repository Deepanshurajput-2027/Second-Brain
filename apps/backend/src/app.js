import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { successResponse } from './shared/responses/apiResponse.js';
import notFoundHandler from './middleware/notFound.middleware.js';
import errorHandler from './middleware/error.middleware.js';
import { authRoutes } from './modules/auth/index.js';
import { knowledgeRoutes } from './modules/knowledge/index.js';
import { collectionsRoutes } from './modules/collections/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/knowledge', knowledgeRoutes);
app.use('/api/v1/collections', collectionsRoutes);
app.use('/api/collections', collectionsRoutes);

app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'Backend Running');
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
