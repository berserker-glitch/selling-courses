/**
 * VDCipher Routes
 * 
 * API endpoints for VDCipher video operations.
 * All routes require authentication via JWT.
 * 
 * @module routes/vdcipherRoutes
 */

import { Router } from 'express';
import { getVideoOTP, listVideos } from '../controllers/vdcipherController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route POST /api/video/otp/:videoId
 * @description Generate OTP for video playback
 * @access Private (authenticated users)
 */
router.post('/otp/:videoId', authMiddleware, getVideoOTP);

/**
 * @route GET /api/video/list
 * @description List all available videos from VDCipher
 * @access Private (teachers and admins only)
 */
router.get('/list', authMiddleware, listVideos);

export default router;
