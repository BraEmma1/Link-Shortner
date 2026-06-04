import express from 'express';
import { protect, optionalProtect } from '../middleware/auth.js';
import { createLink, getLinks, updateLink, deleteLink } from '../controllers/links.js';
import { sanitizeSearchQuery } from '../middleware/sanitize.js';

const router = express.Router();

router.post('/', optionalProtect, createLink);
router.get('/', protect, sanitizeSearchQuery, getLinks);
router.patch('/:id', protect, updateLink);
router.delete('/:id', protect, deleteLink);

export default router;
