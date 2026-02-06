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
import { Plus, GripVertical, Trash2, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogHeader,
    DialogFooter
} from "@/components/ui/dialog";
import { Header } from "@/components/dashboard/Header";
import { CourseBreadcrumb } from "@/components/dashboard/CourseBreadcrumb";

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

    // Chapter/Lesson Dialog States
    const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");

    // For Lessons: we need to know which chapter we are adding to
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");

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
            <Header />
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
                <aside className="w-96 bg-muted/10 flex flex-col border-l">
                    <div className="p-4 border-b flex justify-between items-center bg-background">
                        <h2 className="font-semibold">Curriculum</h2>
                        <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Chapter</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Chapter</DialogTitle>
                                </DialogHeader>
                                <Input
                                    placeholder="Chapter Title"
                                    value={newChapterTitle}
                                    onChange={(e) => setNewChapterTitle(e.target.value)}
                                />
                                <DialogFooter>
                                    <Button onClick={handleAddChapter}>Add Chapter</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {course?.chapters?.map((chapter) => (
                            <div key={chapter.id} className="border rounded-md bg-background overflow-hidden">
                                <div className="p-3 bg-muted/30 flex items-center justify-between group">
                                    <div className="flex items-center gap-2 font-medium">
                                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                        {chapter.title}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-6 w-6"><Pencil className="w-3 h-3" /></Button>
                                    </div>
                                </div>

                                <div className="p-2 space-y-1">
                                    {chapter.lessons?.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-sm cursor-pointer text-sm"
                                            onClick={() => router.push(`/courses/${courseId}/${lesson.id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground text-xs">L{lesson.order}</span>
                                                {lesson.title}
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-xs text-muted-foreground mt-2"
                                        onClick={() => {
                                            setActiveChapterId(chapter.id);
                                            setIsLessonDialogOpen(true);
                                        }}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Lesson
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Direct Lessons (Uncategorized) - Backward Compatibility or Drafts */}
                        {(course as any)?.lessons?.length > 0 && (
                            <div className="border rounded-md bg-background">
                                <div className="p-3 bg-yellow-500/10 text-yellow-600 font-medium text-sm">
                                    Uncategorized Lessons
                                </div>
                                <div className="p-2 space-y-1">
                                    {(course as any).lessons.map((lesson: Lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="p-2 hover:bg-muted/50 rounded-sm text-sm cursor-pointer"
                                            onClick={() => router.push(`/courses/${courseId}/${lesson.id}`)}
                                        >
                                            {lesson.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Lesson Dialog */}
                <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Lesson</DialogTitle>
                        </DialogHeader>
                        <Input
                            placeholder="Lesson Title"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                        />
                        <DialogFooter>
                            <Button onClick={handleAddLesson}>Add Lesson</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
