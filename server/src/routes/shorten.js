import express from 'express';
import { createLimiter } from '../middleware/rateLimiter.js';
import { createLink, getStats } from '../controllers/shorten.js';

const router = express.Router();

router.post('/shorten', createLimiter, createLink);
router.get('/stats/:slug', getStats);

export default router;
