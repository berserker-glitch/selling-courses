'use client';

import { useEffect, useState } from 'react';
import { Watermark } from '@/components/security/Watermark';
import { User } from '@/lib/mock-db';
import { Lock, AlertTriangle } from 'lucide-react';

interface SecurePlayerProps {
    user: User;
    videoId: string;
    title: string;
}

export function SecurePlayer({ user, videoId, title }: SecurePlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Simulate DRM License Acquisition
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                setIsReady(true);
                clearInterval(interval);
            }
            setLoadProgress(Math.min(progress, 100));
        }, 200);

        return () => clearInterval(interval);
    }, [videoId]);

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* DRM Status Overlay */}
            {!isReady && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/90 text-white space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" />
                    <div className="flex items-center space-x-2 text-sm text-blue-400 font-mono">
                        <Lock className="w-4 h-4" />
                        <span>ACQUIRING DRM LICENSE... {Math.round(loadProgress)}%</span>
                    </div>
                </div>
            )}

            {/* Actual Player Content (Mock) */}
            <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
                {isReady ? (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {/* Mock Video Content */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 opacity-50" />
                        <div className="z-10 text-center space-y-2">
                            <h3 className="text-2xl font-bold text-white/90">{title}</h3>
                            <p className="text-zinc-500 font-mono text-xs">VdoCipher Encrypted Stream ID: {videoId}</p>
                            {!isPlaying && (
                                <div className="mt-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                </div>
                            )}
                        </div>

                        {/* Fake progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                            <div
                                className="h-full bg-blue-500 transition-all duration-[1000ms]"
                                style={{ width: isPlaying ? '100%' : '35%' }}
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Forced Watermark Layer */}
            {isReady && <Watermark user={user} />}

            {/* Anti-Recording Warning Layer */}
            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 backdrop-blur-md border border-red-500/50 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>DRM PROTECTED</span>
            </div>
        </div>
    );
}
