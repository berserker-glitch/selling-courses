import express from 'express';
import { register, login, getMe, createStudent, getUsers, enrollStudentInCategory, forgotPassword, resetPassword, updateDeviceLimit } from '../controllers/authController';
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
router.put('/users/:userId/device-limit', protect, updateDeviceLimit); // Teacher sets student device limit

export default router;
