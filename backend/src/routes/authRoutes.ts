import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, getMe, createStudent, getUsers, enrollStudentInCategory, forgotPassword, resetPassword, updateDeviceLimit, validateSession, updateStudent } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * Rate limiter for auth endpoints
 * Prevents brute-force attacks on login/register/forgot-password
 * Allows 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: { message: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Public auth routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.get('/validate-session', protect, validateSession); // Heartbeat endpoint for real-time session validation
router.post('/create-student', protect, createStudent);
router.get('/users', protect, getUsers);
router.put('/users/:id', protect, updateStudent); // Update student details
router.post('/enroll-category', protect, enrollStudentInCategory);
router.put('/users/:userId/device-limit', protect, updateDeviceLimit); // Teacher sets student device limit

export default router;
