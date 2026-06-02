import express from 'express';
import { protect } from '../middleware/auth.js';
import { createLink, getLinks, updateLink, deleteLink } from '../controllers/links.js';
import { sanitizeSearchQuery } from '../middleware/sanitize.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.post('/', createLink);
router.get('/', sanitizeSearchQuery, getLinks);
router.patch('/:id', updateLink);
router.delete('/:id', deleteLink);

export default router;
