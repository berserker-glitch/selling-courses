'use client';

import { useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, Course, Video } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { PlayCircle, Lock, BookOpen, Clock, Zap, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentDashboard() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const user = sessionStore.getUser();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        const allCourses = db.courses.all();
        const accessibleCourses = allCourses.filter(c => user.accessCourseIds.includes(c.id));
        setCourses(accessibleCourses);
    }, [user, router]);

    const handleCourseClick = (courseId: string) => {
        // Direct navigation to the first video of the course
        const courseVideos = db.videos.byCourseId(courseId);
        if (courseVideos.length > 0) {
            router.push(`/watch/${courseVideos[0].id}`);
        } else {
            toast.error("This course has no videos yet.");
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Welcome Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="heading-xl mb-2 text-3xl md:text-5xl">Welcome back, {user.username}</h1>
                        <p className="text-muted-foreground text-lg">You are on track to reach your weekly goals.</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm font-medium bg-secondary/50 px-4 py-2 rounded-full border border-border/50">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </header>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Column: Stats */}
                    <div className="space-y-6">
                        {/* Stat Card 1 */}
                        <div className="glass-card p-6 bg-card border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Hours Learned</span>
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-4xl font-bold mb-1">24.5</div>
                            <div className="text-xs text-green-500 flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12% from last week
                            </div>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="glass-card p-6 bg-card border-border/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Active Courses</span>
                                <BookOpen className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-4xl font-bold mb-1">{courses.length}</div>
                            <div className="text-xs text-muted-foreground">In progress</div>
                        </div>

                        {/* Motivation Card */}
                        <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Daily Tip</h3>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                                "Consistency is the key to mastery. Even 15 minutes a day builds momentum."
                            </p>
                        </div>
                    </div>

                    {/* Right Two Columns: Courses */}
                    <div className="md:col-span-2">
                        <h2 className="heading-lg text-2xl mb-6 flex items-center">
                            <PlayCircle className="w-6 h-6 mr-2 text-primary" />
                            Continue Learning
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {courses.map(course => (
                                <article
                                    key={course.id}
                                    onClick={() => handleCourseClick(course.id)}
                                    className="glass-card group cursor-pointer overflow-hidden border border-border/50 bg-card hover:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none flex flex-col h-full"
                                    tabIndex={0}
                                    role="button"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCourseClick(course.id); }}
                                    aria-label={`Resume course: ${course.title}`}
                                >
                                    <div className="aspect-video relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-image bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${course.thumbnailUrl})` }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        <div className="absolute top-3 right-3">
                                            <span className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest shadow-sm">
                                                Course
                                            </span>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-primary shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                                                <PlayCircle className="w-8 h-8 ml-0.5 fill-current" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-auto">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1 mb-2">{course.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
                                            <div className="flex items-center space-x-1.5 text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span>{db.videos.byCourseId(course.id).length} Lessons</span>
                                            </div>
                                            <span className="font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center">
                                                Resume <span className="ml-1">→</span>
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {courses.length === 0 && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-muted-foreground opacity-50" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">No Active Courses</h3>
                                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                        Contact your administrator to request access to course materials.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
