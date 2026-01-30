import express from 'express';
import { register, login, getMe, createStudent } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-student', protect, createStudent);

export default router;
