import express from 'express';
import { updateProgress, getCourseProgress } from '../controllers/progressController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.put('/lessons/:lessonId/progress', protect, updateProgress);
router.get('/courses/:courseId/progress', protect, getCourseProgress);

export default router;
