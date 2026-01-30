import express from 'express';
import {
    getCourses,
    getCourseById,
    createCourse,
    deleteCourse,
    addLesson,
    enrollCourse
} from '../controllers/courseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Public? Or Protected? Usually protected in this app context.
router.get('/', protect, getCourses);
router.get('/:id', protect, getCourseById);

// Teacher Actions
router.post('/', protect, createCourse);
router.delete('/:id', protect, deleteCourse);
router.post('/:courseId/lessons', protect, addLesson);

// Student Actions
router.post('/:courseId/enroll', protect, enrollCourse);

export default router;
