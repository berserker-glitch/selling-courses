'use client';

import { useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, Course } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { PlayCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StudentDashboard() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const user = sessionStore.getUser();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        // Filter courses based on user access
        const allCourses = db.courses.all();
        const accessibleCourses = allCourses.filter(c => user.accessCourseIds.includes(c.id));
        setCourses(accessibleCourses);
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="heading-xl mb-4 text-3xl md:text-5xl">My Courses</h1>
                    <p className="text-muted-foreground text-lg">Continue your learning journey.</p>
                </header>

                <section aria-label="Course List" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <article
                            key={course.id}
                            onClick={() => router.push(`/course/${course.id}`)}
                            className="glass-card group cursor-pointer overflow-hidden border border-border/50 bg-card hover:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary focus-visible:outline-none"
                            tabIndex={0}
                            role="button"
                            onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/course/${course.id}`); }}
                            aria-label={`View course: ${course.title}`}
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <div className="absolute inset-0 bg-image bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${course.thumbnailUrl})` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="inline-block px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white mb-2 border border-white/10">
                                        COURSE
                                    </span>
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary-foreground transition-colors">{course.title}</h3>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                                        <PlayCircle className="w-6 h-6 ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{course.description}</p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-4">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span>Active Access</span>
                                    </div>
                                    <span className="font-mono opacity-50">ID: {course.id}</span>
                                </div>
                            </div>
                        </article>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No Active Courses</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                You are not currently enrolled in any courses. Please contact your administrator to request access.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
