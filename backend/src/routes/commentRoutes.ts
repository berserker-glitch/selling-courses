import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getComments, createComment, deleteComment } from '../controllers/commentController';

const router = express.Router();

// Public read, protected write? Or protected both?
// Usually comments are visible to enrolled students.
// For now, protecting both to ensure privacy/context.
router.get('/:lessonId', protect, getComments);
router.post('/', protect, createComment);
router.delete('/:commentId', protect, deleteComment);

export default router;
