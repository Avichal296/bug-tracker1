import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many sign-in attempts. Please wait a minute and try again.',
  },
});
