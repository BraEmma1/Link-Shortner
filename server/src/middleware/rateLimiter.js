import { rateLimit } from 'express-rate-limit';

/**
 * Global rate limiter for standard API routes.
 * Limits each IP to 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Stricter rate limiter for authentication routes.
 * Limits each IP to 15 login attempts per 15 minutes to prevent brute-forcing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

/**
 * High-throughput rate limiter for short link redirection engine.
 * Limits each IP to 1000 redirects per minute to shield the database against scrapers/DDoS.
 */
export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit exceeded. Too many redirect requests.',
  },
});
