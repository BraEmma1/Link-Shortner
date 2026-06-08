import express from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import linksRouter from './links.js';
import analyticsRouter from './analytics.js';
import qrcodesRouter from './qrcodes.js';

const router = express.Router();

// Root /api handler — prevents the /:slug wildcard from catching bare /api requests
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Vaultz Links API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      links: '/api/links',
      analytics: '/api/analytics',
      qrcodes: '/api/qrcodes',
    },
  });
});

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/links', linksRouter);
router.use('/analytics', analyticsRouter);
router.use('/qrcodes', qrcodesRouter);

export default router;
