import express from 'express';
import { createQuiz, deleteQuiz, getQuizById, getQuizzes, updateQuiz } from '../controllers/quizController';
import { protect as authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, getQuizzes);
router.get('/:id', authenticateToken, getQuizById);
router.post('/', authenticateToken, createQuiz);
router.put('/:id', authenticateToken, updateQuiz);
router.delete('/:id', authenticateToken, deleteQuiz);

export default router;
