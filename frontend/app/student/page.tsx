"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    IconBook,
    IconLoader2,
    IconUser,
    IconSearch,
    IconPlayerPlay
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    themeColor?: string;
    category: { name: string };
    teacher: { name: string };
    _count: {
        lessons: number;
        enrollments: number;
    };
    progress?: number;
}

interface User {
    name: string;
}

export default function StudentDashboard() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await api.get("/auth/me");
                setUser(userData);

                const coursesData = await api.get("/courses");
                setCourses(coursesData);
                setFilteredCourses(coursesData);
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = courses.filter(course =>
            course.title.toLowerCase().includes(lowerQuery) ||
            course.category.name.toLowerCase().includes(lowerQuery)
        );
        setFilteredCourses(filtered);
    }, [searchQuery, courses]);

    // Simple robust strip HTML for descriptions
    const stripHtml = (html: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, ''); // Basic strip
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-20">
                <IconLoader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Loading courses...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">My Courses</h1>
                    <p className="text-muted-foreground mt-1 max-w-lg">
                        Welcome back, {user?.name}. Track your progress and continue learning.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        className="pl-9 bg-background focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Courses Table */}
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-b-primary/10">
                            <TableHead className="w-[60%] pl-6 py-4 font-semibold text-foreground">Course Details</TableHead>
                            <TableHead className="py-4 font-semibold text-foreground">Category</TableHead>
                            <TableHead className="text-center py-4 font-semibold text-foreground">Lessons</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                    No courses found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => (
                                <TableRow
                                    key={course.id}
                                    className="group cursor-pointer hover:bg-muted/30 transition-colors border-b-muted/50 last:border-0"
                                    onClick={() => router.push(`/courses/${course.id}`)}
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div>
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                                                {course.title}
                                            </div>
                                            <div className="text-sm text-muted-foreground line-clamp-1 max-w-2xl text-ellipsis mt-0.5">
                                                {stripHtml(course.description).substring(0, 100)}...
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-muted-foreground bg-muted/50 border-0 group-hover:bg-background transition-colors">
                                            {course.category?.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-mono font-normal border-muted-foreground/20">
                                            {course._count.lessons}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
