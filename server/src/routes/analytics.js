import express from 'express';
import { protect } from '../middleware/auth.js';
import { getOverallAnalytics, getLinkAnalytics } from '../controllers/analytics.js';

const router = express.Router();

router.use(protect);

router.get('/overall', getOverallAnalytics);
router.get('/:linkId', getLinkAnalytics);

export default router;
