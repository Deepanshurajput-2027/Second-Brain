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
import { memoryRoutes } from './modules/memory/index.js';
import { chatRoutes } from './modules/chat/index.js';
import { userRoutes } from './modules/users/index.js';

const app = express();

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'https://second-brain-4gzxt7v7l-deepanshurajput-2027s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or if origin matches vercel/localhost
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/knowledge', knowledgeRoutes);
app.use('/api/v1/collections', collectionsRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/v1/memories', memoryRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'Backend Running');
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
