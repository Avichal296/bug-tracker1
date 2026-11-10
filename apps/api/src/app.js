import cors from 'cors';
import express from 'express';
import { authRoutes } from './routes/authRoutes.js';
import { bugRoutes } from './routes/bugRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();
  const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/bugs', bugRoutes);
  app.use(errorHandler);

  return app;
}
