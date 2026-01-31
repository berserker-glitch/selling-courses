/**
 * VDCipherPlayer Component
 * 
 * Secure video player using VDCipher's OTP-based embed system.
 * Fetches a one-time token from the backend and renders the VDCipher iframe.
 * 
 * Features:
 * - Automatic OTP generation on mount
 * - Loading and error states
 * - Dynamic watermarking (handled by backend)
 * - Responsive aspect ratio
 * 
 * @module components/VDCipherPlayer
 */

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, PlayCircle } from 'lucide-react';
import api from '@/lib/api';

/**
 * Props for VDCipherPlayer component
 */
interface VDCipherPlayerProps {
    /** VDCipher video ID */
    videoId: string;
    /** Callback when video playback ends */
    onComplete?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** User email for watermarking */
    userEmail?: string;
}

/**
 * VDCipherPlayer - Secure video player with DRM protection
 * 
 * @param props - Component props
 * @returns Video player iframe or loading/error state
 */
export function VDCipherPlayer({ videoId, onComplete, className = '', userEmail }: VDCipherPlayerProps) {
    // OTP and playback info from VDCipher API
    const [otp, setOtp] = useState<string | null>(null);
    const [playbackInfo, setPlaybackInfo] = useState<string | null>(null);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch OTP from backend on component mount or when videoId changes
     */
    useEffect(() => {
        const fetchOTP = async () => {
            // Reset state for new video
            setIsLoading(true);
            setError(null);
            setOtp(null);
            setPlaybackInfo(null);

            // Skip if no video ID provided
            if (!videoId) {
                setIsLoading(false);
                setError('No video ID provided');
                return;
            }

            try {
                // Call backend to generate OTP
                const { data } = await api.post(`/video/otp/${videoId}`);

                if (data.otp && data.playbackInfo) {
                    setOtp(data.otp);
                    setPlaybackInfo(data.playbackInfo);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err: any) {
                console.error('Failed to load video:', err);
                const message = err.response?.data?.message || 'Failed to load video';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOTP();
    }, [videoId]);

    /**
     * Handle iframe load event
     * VDCipher provides postMessage events for player control
     */
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Only process VDCipher messages
            if (event.origin !== 'https://player.vdocipher.com') return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                // Log any errors from the player
                if (data.event === 'error') {
                    console.error('[VDCipher Player Error]:', data);

                    // Handle License Error (6007) specifically
                    if (data.data && data.data.code === 6007) {
                        setError('License Error: Domain not allowed. Please whitelist "localhost" in your VDCipher Dashboard.');
                    } else if (data.data && data.data.message) {
                        setError(`Player Error: ${data.data.message}`);
                    }
                }

                // Video ended event
                if (data.name === 'video' && data.status === 'ended') {
                    onComplete?.();
                }
            } catch (e) {
                // Ignore non-JSON messages
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onComplete]);

    // Loading state
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-sky-500 mx-auto" />
                    <p className="text-sm text-slate-400">Loading video...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
                <div className="text-center space-y-4 p-8">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
                    <div>
                        <p className="text-sm font-medium text-red-400">Video unavailable</p>
                        <p className="text-xs text-slate-500 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // No OTP state (shouldn't happen if loading/error are handled correctly)
    if (!otp || !playbackInfo) {
        return (
            <div className={`flex items-center justify-center bg-slate-900 ${className}`}>
                <div className="text-center space-y-4">
                    <PlayCircle className="h-16 w-16 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500">No video available</p>
                </div>
            </div>
        );
    }

    // Render VDCipher player iframe with full permissions
    return (
        <div className={`relative w-full h-full group ${className}`}>
            {/* Client-side Watermark Overlay (Backup/Extra Visibility) */}
            {userEmail && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
                    {/* Floating watermark top-left */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white/50 text-[10px] font-mono">
                        {userEmail}
                    </div>
                    {/* Bouncing/Moving watermark (simulated with static positions for now, or CSS animation) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 text-white text-xl font-bold -rotate-12 whitespace-nowrap">
                        {userEmail}
                    </div>
                    <div className="absolute bottom-16 right-8 opacity-20 text-white/30 text-xs">
                        ID: {userEmail.split('@')[0]}
                    </div>
                </div>
            )}

            <iframe
                src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                title="Course Video"
                allowFullScreen={true}
            />
        </div>
    );
}

export default VDCipherPlayer;
