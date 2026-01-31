import express from 'express';
import { register, login, getMe, createStudent, getUsers, enrollStudentInCategory, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.post('/create-student', protect, createStudent);
router.get('/users', protect, getUsers);
router.post('/enroll-category', protect, enrollStudentInCategory);

export default router;
