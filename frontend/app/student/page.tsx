"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    IconBook,
    IconLoader2,
    IconLogout,
    IconPlayerPlay,
    IconUser
} from "@tabler/icons-react";

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
    progress?: number; // Backend might return this if enrolled, need to check
}

interface User {
    name: string;
    email: string;
}

export default function StudentDashboard() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User
                const userData = await api.get("/auth/me");
                setUser(userData);

                // Fetch Courses (filtered by category on backend)
                const coursesData = await api.get("/courses");
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to load dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {});
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20">
            {/* Header */}
            <header className="bg-background border-b px-6 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <IconBook className="w-6 h-6" />
                        </div>
                        <span>Student Portal</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <IconUser className="w-4 h-4" />
                            <span>{user?.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                            <IconLogout className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">My Courses</h1>
                    <p className="text-muted-foreground">
                        Access your enrolled learning materials and track your progress.
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-20 bg-background border rounded-xl shadow-sm">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <IconBook className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No courses available</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            You don't have access to any courses yet. Please contact your instructor.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-muted">
                                <div className="aspect-video w-full bg-muted relative overflow-hidden">
                                    {/* Thumbnail or Placeholder */}
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                                            <IconBook className="w-12 h-12" />
                                        </div>
                                    )}

                                    {/* Overlay Badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="secondary" className="bg-background/90 backdrop-blur shadow-sm">
                                            {course.category?.name}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {course.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-3">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span>{course._count.lessons} Lessons</span>
                                        </div>
                                        <span>{course.teacher?.name}</span>
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <Button className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground" variant="secondary" onClick={() => router.push(`/courses/${course.id}`)}>
                                        <IconPlayerPlay className="w-4 h-4" />
                                        Continue Learning
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
