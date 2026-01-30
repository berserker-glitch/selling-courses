import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    deleteCourse,
    updateCourse,
    addLesson,
    updateLesson,
    deleteLesson,
    enrollCourse
} from '../controllers/courseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public? Or Protected? Usually protected in this app context.
router.get('/', protect, getCourses);
router.get('/:id', protect, getCourseById);

// Teacher Actions
router.post('/', protect, createCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

router.post('/:courseId/lessons', protect, addLesson);
router.put('/:courseId/lessons/:lessonId', protect, updateLesson);
router.delete('/:courseId/lessons/:lessonId', protect, deleteLesson);

// Student Actions
router.post('/:courseId/enroll', protect, enrollCourse);

export default router;
