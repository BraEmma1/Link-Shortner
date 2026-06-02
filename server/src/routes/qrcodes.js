import express from 'express';
import { protect } from '../middleware/auth.js';
import { getQRCodes, downloadQRCode } from '../controllers/qrcodes.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.route('/')
  .get(getQRCodes);

router.route('/:id/download')
  .get(downloadQRCode);

export default router;
