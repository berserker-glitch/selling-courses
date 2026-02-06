import { Router } from 'express';
import * as uploadController from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Only teachers and admins can upload files
router.post('/', protect, uploadController.upload.single('file'), uploadController.handleUpload);

export default router;
