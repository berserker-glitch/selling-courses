'use client';

import { use, useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, User, Video, Course } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { SecurePlayer } from '@/components/player/SecurePlayer';
import { ChevronLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function WatchPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter();
    const { videoId } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [video, setVideo] = useState<Video | null>(null);
    const [course, setCourse] = useState<Course | null>(null);

    useEffect(() => {
        const currentUser = sessionStore.getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const foundVideo = db.videos.findById(videoId);
        if (foundVideo) {
            // Check access
            if (!currentUser.accessCourseIds.includes(foundVideo.courseId)) {
                toast.error('Access Denied', { description: 'You do not have permission to view this content.' });
                router.push('/dashboard');
                return;
            }

            setVideo(foundVideo);
            const foundCourse = db.courses.findById(foundVideo.courseId);
            setCourse(foundCourse || null);

            // Log playback start
            db.logs.add({
                userId: currentUser.id,
                action: 'PLAYBACK_START',
                metadata: { videoId: videoId, title: foundVideo.title },
                ip: '127.0.0.1'
            });
        } else {
            router.push('/dashboard');
        }

        return () => {
            if (currentUser) {
                db.logs.add({
                    userId: currentUser.id,
                    action: 'PLAYBACK_STOP',
                    metadata: { videoId: videoId },
                    ip: '127.0.0.1'
                });
            }
        };
    }, [videoId, router]);

    if (!user || !video) return null;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Dark Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-950">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-200">{video.title}</h1>
                        <p className="text-xs text-zinc-500">{course?.title}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
                    <ShieldAlert className="w-4 h-4 text-green-500" />
                    <span>SECURE CONNECTION</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-2" />
                </div>
            </header>

            {/* Player Container */}
            <main className="flex-1 flex items-center justify-center p-4 md:p-8 bg-zinc-950 relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="w-full max-w-5xl z-10 space-y-4">
                    {/* Security Warning */}
                    <div className="text-center mb-6 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                            Forensic Watermarking Active • ID: {user.studentNumber} • IP: 127.0.0.1
                        </p>
                    </div>

                    <SecurePlayer
                        user={user}
                        videoId={video.id}
                        title={video.title}
                    />

                    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-xl p-6 mt-8">
                        <h2 className="text-lg font-bold mb-2">Session Notes</h2>
                        <p className="text-sm text-zinc-400">
                            This session is monitored. Any attempt to record, screenshot, or share this content will result in immediate account termination.
                            Your unique session ID is <span className="font-mono text-white bg-white/10 px-1 rounded">{Math.random().toString(36).substring(7)}</span>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
