'use client';

import { use, useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, Course, Video } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Play, Clock, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params); // Next.js 15+ convention for async params
    const [course, setCourse] = useState<Course | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const user = sessionStore.getUser();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!user.accessCourseIds.includes(id)) {
            router.push('/dashboard');
            return;
        }

        const foundCourse = db.courses.findById(id);
        if (foundCourse) {
            setCourse(foundCourse);
            setVideos(db.videos.byCourseId(id));
        }
    }, [id, user, router]);

    if (!user || !course) return null;

    return (
        <div className="min-h-screen bg-background">
            <DashboardNavbar />

            {/* Hero Section */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-image bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnailUrl})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 pb-8">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-8 left-4 flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </button>

                    <span className="text-primary font-bold text-sm tracking-wider uppercase mb-2">Course Material</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{course.title}</h1>
                    <p className="text-muted-foreground max-w-2xl text-lg">{course.description}</p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    {videos.map((video, index) => (
                        <div
                            key={video.id}
                            onClick={() => router.push(`/watch/${video.id}`)}
                            className="group flex flex-col md:flex-row items-center p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
                        >
                            <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0 mb-4 md:mb-0 md:mr-6 group-hover:ring-2 ring-primary/50 transition-all">
                                {/* Thumbnail placeholder */}
                                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-600">
                                    <Play className="w-8 h-8 opacity-50" />
                                </div>
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                                    {video.duration}
                                </div>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded">Lesson {index + 1}</span>
                                </div>
                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{video.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">Secure content ID: {video.vdocipherId}</p>
                            </div>

                            <div className="md:ml-auto flex items-center text-muted-foreground group-hover:text-foreground transition-colors">
                                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                                    <Play className="w-4 h-4 ml-0.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
