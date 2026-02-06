"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock } from "lucide-react";

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

    if (loading) {
        return <div className="text-center py-10">Loading courses...</div>;
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No courses found. Create your first course!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                <BookOpen className="h-12 w-12 opacity-20" />
                            </div>
                        )}
                        <Badge className="absolute top-2 right-2" variant="secondary">
                            {course.category?.name || "Uncategorized"}
                        </Badge>
                    </div>

                    <CardHeader>
                        <CardTitle className="line-clamp-1 text-lg" title={course.title}>
                            {course.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">By {course.teacher?.name}</p>
                    </CardHeader>

                    <CardContent className="flex-1">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course._count?.lessons || 0} Lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{course._count?.enrollments || 0} Students</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                        <Link href={`/courses/${course.id}`} className="w-full">
                            <Button className="w-full" variant="outline">
                                Manage Course
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
