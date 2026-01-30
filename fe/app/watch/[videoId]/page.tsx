'use client';

import { use, useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, User, Video, Course } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { SecurePlayer } from '@/components/player/SecurePlayer';
import { ChevronLeft, ShieldAlert, Play, CheckCircle2, ListVideo } from 'lucide-react';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WatchPage({ params }: { params: Promise<{ videoId: string }> }) {
    const router = useRouter();
    const { videoId } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [video, setVideo] = useState<Video | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [playlist, setPlaylist] = useState<Video[]>([]);

    useEffect(() => {
        const currentUser = sessionStore.getUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }
        setUser(currentUser);

        const foundVideo = db.videos.findById(videoId);
        if (foundVideo) {
            if (!currentUser.accessCourseIds.includes(foundVideo.courseId)) {
                toast.error('Access Denied', { description: 'You do not have permission to view this content.' });
                router.push('/dashboard');
                return;
            }

            setVideo(foundVideo);
            const foundCourse = db.courses.findById(foundVideo.courseId);
            setCourse(foundCourse || null);
            if (foundCourse) {
                setPlaylist(db.videos.byCourseId(foundCourse.id));
            }

            db.logs.add({
                userId: currentUser.id,
                action: 'PLAYBACK_START',
                metadata: { videoId: videoId, title: foundVideo.title },
                ip: '127.0.0.1' // Mock IP
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
                    ip: '127.0.0.1' // Mock IP
                });
            }
        };
    }, [videoId, router]);

    const handlePlaylistClick = (vidId: string) => {
        if (vidId === videoId) return;
        router.push(`/watch/${vidId}`);
    };

    if (!user || !video || !course) return null;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <DashboardNavbar />

            <main className="max-w-[1600px] mx-auto w-full px-4 py-6 md:py-8 flex-1">

                {/* Breadcrumb / Back Navigation */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="hover:text-primary transition-colors flex items-center"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Dashboard
                    </button>
                    <span>/</span>
                    <span className="font-semibold text-foreground">{course.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column: Player & Info (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Visual Player Wrapper */}
                        <div className="glass-card bg-card border border-border/50 overflow-hidden shadow-2xl shadow-black/5 relative group">
                            {/* Security Badge Overlay */}
                            <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                <ShieldAlert className="w-3 h-3 text-green-500" />
                                <span>Secure Stream</span>
                            </div>

                            <SecurePlayer
                                user={user}
                                videoId={video.id}
                                title={video.title}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="heading-xl text-2xl md:text-4xl mb-2">{video.title}</h1>
                                <p className="text-muted-foreground text-lg">{course.description}</p>
                            </div>
                            {/* Action buttons could go here (e.g. "Mark Complete", "Notes") */}
                        </div>

                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm flex items-start space-x-3">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <p>
                                <strong>Security Notice:</strong> Your session is being monitored. Visible and invisible forensic watermarks containing your User ID ({user.studentNumber}) are embedded in the stream. Screen recording or sharing is strictly prohibited and will result in immediate account termination.
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Playlist Sidebar (1 col) */}
                    <div className="lg:col-span-1">
                        <div className="glass-card bg-card border border-border/50 sticky top-24 flex flex-col h-[calc(100vh-140px)]">
                            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                                <div className="flex items-center space-x-2">
                                    <ListVideo className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-lg">Course Content</h3>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border/50 max-w">
                                    {playlist.length} Lessons
                                </span>
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                                {playlist.map((vid, idx) => {
                                    const isActive = vid.id === video.id;
                                    return (
                                        <button
                                            key={vid.id}
                                            onClick={() => handlePlaylistClick(vid.id)}
                                            className={cn(
                                                "w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all border border-transparent",
                                                isActive
                                                    ? "bg-primary/10 border-primary/20 shadow-sm"
                                                    : "hover:bg-muted/50 hover:border-border/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
                                                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {isActive ? <Play className="w-3 h-3 ml-0.5 fill-current" /> : idx + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    "text-sm font-semibold truncate",
                                                    isActive ? "text-primary" : "text-foreground"
                                                )}>
                                                    {vid.title}
                                                </h4>
                                                <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                                                    <span>Video • {vid.duration}</span>
                                                    {/* Mock completion status used previously */}
                                                    {/* {idx < 2 && <CheckCircle2 className="w-3 h-3 text-green-500" />} */}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
