import express from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import linksRouter from './links.js';
import analyticsRouter from './analytics.js';
import qrcodesRouter from './qrcodes.js';

const router = express.Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/links', linksRouter);
router.use('/analytics', analyticsRouter);
router.use('/qrcodes', qrcodesRouter);

export default router;
