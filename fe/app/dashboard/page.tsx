'use client';

import { useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, Course } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { PlayCircle, Lock } from 'lucide-react';

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
        <div className="min-h-screen bg-background">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                    <p className="text-muted-foreground">Continue your learning journey.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            onClick={() => router.push(`/course/${course.id}`)}
                            className="glass-card group cursor-pointer overflow-hidden border border-border/50 bg-card hover:border-primary/50"
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
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span>Active Access</span>
                                    </div>
                                    <span>ID: {course.id}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No Active Courses</h3>
                            <p className="text-muted-foreground text-sm">Contact your administrator to enroll in courses.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
