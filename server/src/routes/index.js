import express from 'express';
import healthRouter from './health.js';
import shortenRouter from './shorten.js';

const router = express.Router();

// Root /api handler — prevents the /:slug wildcard from catching bare /api requests
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Vaultz Links API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      shorten: 'POST /api/shorten',
      stats: 'GET /api/stats/:slug',
    },
  });
});

router.use('/health', healthRouter);
router.use('/', shortenRouter);

export default router;
