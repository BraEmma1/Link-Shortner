// Load environment variables first — before any other imports
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dns from "node:dns/promises";

// Configure public DNS servers to resolve MongoDB Atlas SRV query issues on local networks
dns.setServers(["1.1.1.1", "1.0.0.1"]);

// ─────────────────────────────────────────────
// Environment Variable Validation
// ─────────────────────────────────────────────
const requiredEnv = ['MONGO_URI', 'WP_JWT_SECRET', 'CLIENT_URL'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const errorMsg = `❌ Missing critical environment variables: ${missing.join(', ')}`;
  if (process.env.NODE_ENV === 'production') {
    console.error(errorMsg);
    process.exit(1);
  } else {
    console.warn(`⚠️ Warning: ${errorMsg}. Dev environment may not function properly.`);
  }
}

if (
  process.env.WP_JWT_SECRET === 'your_wordpress_jwt_secret_here' &&
  process.env.NODE_ENV === 'production'
) {
  console.error('❌ Security Alert: WP_JWT_SECRET is set to the insecure default placeholder in production!');
  process.exit(1);
}

import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter, redirectLimiter } from './middleware/rateLimiter.js';
import { cleanMongoInputs } from './middleware/sanitize.js';
import logger from './config/logger.js';

// ─────────────────────────────────────────────
// Database Connection
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────
const app = express();

// Set trust proxy (crucial for accurate IP rate limiting behind proxies like Render/Heroku/Nginx)
app.set('trust proxy', 1);

// ─────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────

// Helmet - HTTP Security Headers
app.use(helmet());

// CORS — secure allowed origins mapping
// CLIENT_URL supports: exact URLs, comma-separated list, wildcard *, or glob patterns like *.vercel.app
const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

// Convert entries like *.vercel.app into RegExp for pattern matching, ensuring they are standardized
const allowedOrigins = rawOrigins.map((o) => {
  // Strip protocol and trailing slash for standardization if it's not a wildcard
  let clean = o.trim();
  if (clean !== '*') {
    clean = clean.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
  if (clean.includes('*')) {
    const escaped = clean.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^(https?:\\/\\/)?([^\\/]+\\.)?${escaped}$`, 'i');
  }
  return clean;
});

const isOriginAllowed = (origin) => {
  const cleanOrigin = origin.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed instanceof RegExp) {
      return allowed.test(origin) || allowed.test(cleanOrigin);
    }
    return allowed === cleanOrigin;
  });
};


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies / Authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// NoSQL Injection Sanitization
app.use(cleanMongoInputs);

// Parse incoming JSON bodies (max 10kb to prevent payload overflow DOS)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// HTTP request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────
// API Routes — all mounted under /api (with rate limiter)
// ─────────────────────────────────────────────
app.use('/api', apiLimiter, apiRoutes);

import { handleRedirect } from './controllers/redirect.js';

// ─────────────────────────────────────────────
// Short Link Redirect Engine (MUST be before 404)
// ─────────────────────────────────────────────
app.get('/:slug', redirectLimiter, handleRedirect);

// ─────────────────────────────────────────────
// 404 Handler — catches unmatched routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────
// Global Error Handler — must be last
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀  Vaultz Links API running on http://localhost:${PORT}`);
  logger.info(`📡  Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown on unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('💥 Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
