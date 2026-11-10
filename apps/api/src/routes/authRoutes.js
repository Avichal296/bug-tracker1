import { Router } from 'express';
import { login, signup } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/authRateLimiter.js';

export const authRoutes = Router();

authRoutes.post('/signup', authRateLimiter, signup);
authRoutes.post('/login', authRateLimiter, login);
