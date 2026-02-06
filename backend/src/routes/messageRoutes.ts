import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/messages/:conversationId', messageController.getMessages);
router.post('/conversations', messageController.startConversationWithAdmin);
router.post('/messages', messageController.sendMessage);

export default router;
