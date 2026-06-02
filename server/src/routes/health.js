import express from 'express';
const router = express.Router();

/**
 * @route  GET /api/health
 * @desc   Health check endpoint — used by uptime monitors and CI checks
 * @access Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'Vaultz Links API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export default router;
