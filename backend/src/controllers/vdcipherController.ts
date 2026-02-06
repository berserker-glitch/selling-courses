/**
 * VDCipher Controller
 * 
 * Handles secure video playback through VDCipher's OTP-based system.
 * Generates one-time playback tokens for authenticated users.
 * 
 * @module controllers/vdcipherController
 */

import { Request, Response } from 'express';
import { logAudit } from '../services/auditService';

/** VDCipher API base URL for generating OTPs */
const VDCIPHER_API_URL = 'https://dev.vdocipher.com/api';

/** API secret from environment variables */
const VDCIPHER_API_SECRET = process.env.VDCIPHER_API || '';

/**
 * Generates a one-time password (OTP) for secure video playback.
 * 
 * This endpoint:
 * 1. Validates the user is authenticated
 * 2. Calls VDCipher API to generate an OTP
 * 3. Returns OTP and playbackInfo for frontend embed
 * 
 * @route POST /api/video/otp/:videoId
 * @param {string} videoId - VDCipher video ID
 * @returns {Object} { otp: string, playbackInfo: string }
 */
export const getVideoOTP = async (req: Request, res: Response) => {
    try {
        const { videoId } = req.params as { videoId: string };
        const user = (req as any).user;

        // Get API secret at runtime (not at module load time)
        const apiSecret = process.env.VDCIPHER_API;

        if (!apiSecret) {
            console.error('VDCipher API secret not configured');
            return res.status(500).json({ message: 'Video service not configured' });
        }

        // Validate videoId format (basic validation)
        if (!videoId || videoId.length < 10) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        console.log(`[VDCipher] Generating OTP for video: ${videoId}`);

        // Log video access attempt for audit trail
        await logAudit(user.id, 'VIDEO_ACCESS', { videoId }, req);

        // Call VDCipher API to generate OTP
        // Using simple request without annotations first to verify basic functionality
        const response = await fetch(`${VDCIPHER_API_URL}/videos/${videoId}/otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Apisecret ${apiSecret}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // Minimal request - no annotations to avoid potential issues
                ttl: 300, // OTP valid for 5 minutes
                // Dynamic Watermark (Anti-piracy)
                annotate: JSON.stringify([{
                    type: 'rtext', // Moving text
                    text: `${user.name} - ${user.email}${user.phoneNumber ? ` - ${user.phoneNumber}` : ''}`,
                    alpha: '0.60', // Slightly transparent
                    color: '0xFFFFFF', // White
                    size: '15', // Readable size
                    interval: '5000', // Move every 5 seconds
                    skip: '2000' // Initial delay
                }])
            })
        });

        console.log(`[VDCipher] API Response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[VDCipher] API Error:', response.status, JSON.stringify(errorData));

            // Handle specific error cases
            if (response.status === 404) {
                return res.status(404).json({ message: 'Video not found in VDCipher' });
            }
            if (response.status === 401 || response.status === 403) {
                return res.status(500).json({ message: 'VDCipher API authentication failed. Check API key.' });
            }

            return res.status(500).json({
                message: 'Failed to generate video playback token',
                error: errorData.message || 'Unknown error'
            });
        }

        const data = await response.json();
        console.log('[VDCipher] OTP generated successfully');

        // VDCipher returns { otp, playbackInfo }
        res.json({
            otp: data.otp,
            playbackInfo: data.playbackInfo
        });

    } catch (error: any) {
        console.error('[VDCipher] OTP Error:', error.message);
        res.status(500).json({ message: 'Error generating video access token' });
    }
};

/**
 * Lists all videos from VDCipher account.
 * Useful for teachers to browse available videos.
 * 
 * @route GET /api/video/list
 * @returns {Array} List of video objects with id, title, status
 */
export const listVideos = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        // Only teachers and admins can list videos
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const response = await fetch(`${VDCIPHER_API_URL}/videos`, {
            method: 'GET',
            headers: {
                'Authorization': `Apisecret ${VDCIPHER_API_SECRET}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('VDCipher List Error:', response.status);
            return res.status(500).json({ message: 'Failed to fetch video list' });
        }

        const data = await response.json();

        // Return only necessary fields
        const videos = (data.rows || []).map((video: any) => ({
            id: video.id,
            title: video.title,
            status: video.status,
            length: video.length,
            posters: video.posters
        }));

        res.json(videos);

    } catch (error: any) {
        console.error('VDCipher List Error:', error);
        res.status(500).json({ message: 'Error fetching video list' });
    }
};
