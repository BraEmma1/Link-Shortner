import { rateLimit } from 'express-rate-limit';

const limiter = (windowMs, max, error) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error },
  });

/** General API limiter: 300 requests per 15 minutes per IP. */
export const apiLimiter = limiter(
  15 * 60 * 1000,
  300,
  'Too many requests from this IP, please try again after 15 minutes.'
);

/** Link creation limiter: 30 per 15 minutes per IP. Creation is open to everyone, so this limits abuse. */
export const createLimiter = limiter(
  15 * 60 * 1000,
  30,
  'Too many link creation attempts from this IP, please try again later.'
);

/** Redirect limiter: 1000 per minute per IP. */
export const redirectLimiter = limiter(
  60 * 1000,
  1000,
  'Rate limit exceeded. Too many redirect requests.'
);
