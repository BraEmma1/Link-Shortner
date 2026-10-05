import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const databaseStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

/**
 * @route  GET /api/health
 * @desc   Health check endpoint — used by uptime monitors and CI checks
 * @access Public
 */
router.get('/', (req, res) => {
  const databaseState =
    databaseStates[mongoose.connection.readyState] || 'unknown';
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  res.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    status: isDatabaseConnected ? 'ok' : 'degraded',
    service: 'Vaultz Links API',
    database: { state: databaseState },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

router.get('/debug', (req, res) => {
  res.status(200).json({
    success: true,
    clientUrlEnv: process.env.CLIENT_URL || 'not set',
    nodeEnv: process.env.NODE_ENV,
    serverTime: new Date().toISOString(),
  });
});

export default router;
