"use client";

import { useEffect, useState } from "react";
import { IconLoader2, IconPlayerPlay, IconAlertCircle } from "@tabler/icons-react";
import { api } from "@/lib/api";

interface VideoPlayerProps {
    videoId?: string;
    courseId?: string; // Optional/Unused now
    lessonId?: string; // Optional/Unused now
    chapterId?: string;
    autoPlay?: boolean;
}

export default function VideoPlayer({
    videoId,
    courseId,
    lessonId,
    autoPlay = false
}: VideoPlayerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadVideo = async () => {
            if (!videoId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Check if videoId is already a URL
                if (videoId.startsWith("http")) {
                    setVideoUrl(videoId);
                    setLoading(false);
                    return;
                }

                // If VDCipher ID (typically 32 chars hex), we need OTP
                // Endpoint: POST /api/video/otp/:videoId
                try {
                    // Pass empty object as body since calling POST
                    const data = await api.post(`/video/otp/${videoId}`, {});

                    if (data.otp && data.playbackInfo) {
                        setVideoUrl(`https://player.vdocipher.com/v2/?otp=${data.otp}&playbackInfo=${data.playbackInfo}`);
                    } else if (data.url) {
                        setVideoUrl(data.url);
                    } else {
                        // Fallback or specific error
                        console.warn("No video URL returned from OTP endpoint");
                        setError("Video playback requires backend integration");
                    }
                } catch (e) {
                    console.warn("Failed to fetch OTP", e);
                    // Fallback check: is it a Vimeo ID?
                    if (/^\d+$/.test(videoId)) {
                        setVideoUrl(`https://player.vimeo.com/video/${videoId}`);
                    } else {
                        // Likely VDCipher without backend support yet
                        // Show ID for now
                        setError("Video unavailable (Backend OTP required)");
                    }
                }

            } catch (err) {
                console.error(err);
                setError("Failed to load video");
            } finally {
                setLoading(false);
            }
        };

        loadVideo();
    }, [videoId, courseId, lessonId]);

    if (!videoId) {
        return (
            <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <IconPlayerPlay className="w-8 h-8 text-white/50" />
                </div>
                <p className="text-lg font-medium">No video content</p>
                <p className="text-sm text-white/50 mt-1">This lesson has no video attached.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-black text-white">
                <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                <IconAlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-lg font-medium text-destructive">Playback Error</p>
                <p className="text-sm text-white/70 mt-2">{error}</p>
                <p className="text-xs text-white/30 mt-4 font-mono">ID: {videoId}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-0 pb-[56.25%] bg-black">
            {videoUrl && (
                <iframe
                    src={videoUrl}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allowFullScreen
                    allow="encrypted-media; autoplay"
                    title="Video Player"
                />
            )}
        </div>
    );
}
