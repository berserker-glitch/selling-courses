"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    category: { name: string };
    teacher: { name: string };
    _count: {
        lessons: number;
        enrollments: number;
    };
}

export function CourseList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await api.get("/courses");
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    // Deterministic color generator for courses without thumbnails
    const getGradient = (id: string) => {
        const colors = [
            "from-blue-500/20 to-purple-500/20 text-blue-700",
            "from-emerald-500/20 to-teal-500/20 text-emerald-700",
            "from-orange-500/20 to-red-500/20 text-orange-700",
            "from-pink-500/20 to-rose-500/20 text-pink-700",
            "from-indigo-500/20 to-cyan-500/20 text-indigo-700",
        ];
        const index = id.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[300px] rounded-xl bg-muted/50 animate-pulse" />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No courses created yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first course.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
                const gradientClass = getGradient(course.id);

                return (
                    <Link key={course.id} href={`/courses/${course.id}`} className="group block h-full">
                        <Card className="h-full flex flex-col overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            {/* Thumbnail Section */}
                            <div className="aspect-[16/9] relative overflow-hidden bg-muted">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${gradientClass.split(" ").slice(0, 2).join(" ")} flex items-center justify-center`}>
                                        <BookOpen className={`h-10 w-10 ${gradientClass.split(" ").pop()} opacity-50`} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <Badge className="absolute top-3 right-3 shadow-sm bg-white/90 text-black hover:bg-white backdrop-blur-md border-0" variant="secondary">
                                    {course.category?.name || "General"}
                                </Badge>
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="line-clamp-1 text-lg font-bold group-hover:text-primary transition-colors" title={course.title}>
                                    {course.title}
                                </CardTitle>
                                {course.teacher && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        {course.teacher.name}
                                    </p>
                                )}
                            </CardHeader>

                            <CardContent className="flex-1 pb-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="h-4 w-4 text-primary/70" />
                                        <span className="font-medium text-foreground">{course._count?.lessons || 0}</span> Lessons
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-4 w-4 text-primary/70" />
                                        <span className="font-medium text-foreground">{course._count?.enrollments || 0}</span> Students
                                    </div>
                                </div>
                            </CardContent>

                            {/* Hover Action Strip */}
                            <div className="h-1 w-full bg-primary/10 group-hover:bg-primary transition-colors duration-300" />
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
