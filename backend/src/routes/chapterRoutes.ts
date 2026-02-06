import express from 'express';
import {
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters
} from '../controllers/chapterController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/:courseId/chapters', protect, createChapter);
router.put('/chapters/:chapterId', protect, updateChapter);
router.delete('/chapters/:chapterId', protect, deleteChapter);
router.put('/:courseId/chapters/reorder', protect, reorderChapters);

export default router;
