import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/conversations', messageController.getConversations);
router.get('/messages/:conversationId', messageController.getMessages);
router.post('/conversations', messageController.startConversationWithAdmin);
router.post('/messages', messageController.sendMessage);

export default router;
