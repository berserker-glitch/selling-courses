"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No courses created yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first course.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Lessons</TableHead>
                        <TableHead className="text-right">Students</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell>
                                <div className="h-10 w-16 bg-muted rounded overflow-hidden relative">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground">
                                            <BookOpen className="h-4 w-4 opacity-50" />
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                {course.title}
                            </TableCell>
                            <TableCell>
                                {course.teacher?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-normal">
                                    {course.category?.name || "Uncategorized"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {course._count?.lessons || 0}
                            </TableCell>
                            <TableCell className="text-right">
                                {course._count?.enrollments || 0}
                            </TableCell>
                            <TableCell>
                                <Link href={`/courses/${course.id}`}>
                                    <Button variant="ghost" size="sm">
                                        Manage
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
