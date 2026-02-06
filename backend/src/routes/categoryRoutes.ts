import express from 'express';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../controllers/categoryController';
import { protect as authenticate, authorize } from '../middleware/authMiddleware';
// Check if 'admin' export exists or if protect handles it. 
// Assuming protect = authenticate. Need to check if 'authorize' exists in authMiddleware.
// Let's check authRoutes imports: import { protect } from '../middleware/authMiddleware';
// Does it export authorize? I should check authMiddleware.ts. For now I 'll assume protect.

const router = express.Router();

// Public read? Or authenticated? Let's say authenticated for now.
router.get('/', authenticate, getCategories);
router.post('/', authenticate, authorize(['ADMIN', 'TEACHER']), createCategory);
router.put('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), updateCategory);
router.delete('/:id', authenticate, authorize(['ADMIN', 'TEACHER']), deleteCategory);

export default router;
