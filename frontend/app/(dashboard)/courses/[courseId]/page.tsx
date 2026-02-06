"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";



import { CourseBreadcrumb } from "@/components/dashboard/CourseBreadcrumb";
import { CurriculumSidebar } from "@/components/dashboard/CurriculumSidebar";

// Types
interface Course {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    chapters: Chapter[];
    category: { id: string; name: string };
}
interface Chapter {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}
interface Lesson {
    id: string;
    title: string;
    order: number;
}
interface Category {
    id: string;
    name: string;
}

export default function CourseEditorPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        categoryId: "",
        description: ""
    });

    // Missing state variables restoration
    const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
            fetchCategories();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const data = await api.get(`/courses/${courseId}`);
            setCourse(data);
            setFormData({
                title: data.title,
                categoryId: data.categoryId,
                description: data.description
            });
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch course", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await api.get("/categories");
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const handleSaveCourse = async () => {
        setSaving(true);
        try {
            await api.put(`/courses/${courseId}`, formData);
            // Show toast success
        } catch (error) {
            console.error("Failed to update course", error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddChapter = async () => {
        if (!newChapterTitle) return;
        try {
            await api.post(`/courses/${courseId}/chapters`, { title: newChapterTitle });
            setNewChapterTitle("");
            setIsChapterDialogOpen(false);
            fetchCourse(); // Refresh
        } catch (error) {
            console.error("Failed to add chapter", error);
        }
    };

    const handleAddLesson = async () => {
        if (!newLessonTitle || !activeChapterId) return;
        try {
            // Note: Current backend API for addLesson expects courseId in param, 
            // but we modified schema to link lesson to chapter. 
            // We need to update backend/controllers/courseController logic to support chapterId if we use the old endpoint
            // OR use a new endpoint for lesson creation under a chapter.
            // The plan said "Create/Update Lesson Routes". I didn't create a specific route for "create lesson in chapter" yet?
            // Actually I did not create `lessonRoutes.ts` yet specifically for chapter attachment?
            // Wait, schema has `chapterId`.
            // I should assume I updated `addLesson` or create a new endpoint.
            // Let's assume standard REST: POST /api/chapters/:chapterId/lessons
            // But I didn't verify that route exists.
            // Retrying: I will assume I can pass `chapterId` to the existing `addLesson` endpoint if I updated it, or I missed updating the controller to accept chapterId. 
            // Looking at `addLesson` in `courseController.ts` (step 36):
            // It takes `courseId` from params. `lessonSchema` (step 36) has title, description...
            // It DOES NOT accept `chapterId`.
            // I need to update `courseController.ts` > `addLesson` to accept `chapterId`.

            // Temporary Workaround: I'll use the existing /courses/:id/lessons endpoint but I need to modify backend to attach it to the chapter if provided in body.
            // I'll update the backend controller in next step. For now, frontend sends it.

            await api.post(`/courses/${courseId}/lessons`, {
                title: newLessonTitle,
                duration: "0",
                chapterId: activeChapterId
            });

            setNewLessonTitle("");
            setIsLessonDialogOpen(false);
            fetchCourse();
        } catch (error) {
            console.error("Failed to add lesson", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex h-screen flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Course Details */}
                <main className="flex-1 overflow-y-auto p-8 border-r">
                    <CourseBreadcrumb
                        items={[
                            { label: course?.title || "Loading..." }
                        ]}
                    />

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Course Details</h1>
                        <Button onClick={handleSaveCourse} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>

                    <div className="space-y-6 max-w-3xl">
                        <div className="space-y-2">
                            <Label>Course Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.categoryId || ""}
                                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                            />
                        </div>
                    </div>
                </main>

                {/* Sidebar - Curriculum */}
                <CurriculumSidebar
                    courseId={courseId as string}
                    course={course}
                    onRefresh={fetchCourse}
                />
            </div>
        </div>
    );
}

