import express from 'express';
import {
    createContentBlock,
    updateContentBlock,
    deleteContentBlock,
    reorderContentBlocks
} from '../controllers/contentBlockController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/lessons/:lessonId/blocks', protect, createContentBlock);
router.put('/blocks/:blockId', protect, updateContentBlock);
router.delete('/blocks/:blockId', protect, deleteContentBlock);
router.put('/lessons/:lessonId/blocks/reorder', protect, reorderContentBlocks);

export default router;
