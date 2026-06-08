import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1', '1.0.0.1']);

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

connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

const allowedOrigins = rawOrigins.map((o) => {
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
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cleanMongoInputs);

// Parse incoming JSON bodies (max 10kb to prevent payload overflow DOS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter, apiRoutes);

import { handleRedirect } from './controllers/redirect.js';

app.get('/:slug', redirectLimiter, handleRedirect);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀  Vaultz Links API running on http://localhost:${PORT}`);
  logger.info(`📡  Environment: ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('💥 Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
