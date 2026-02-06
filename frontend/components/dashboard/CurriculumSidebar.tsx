"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
    DialogHeader,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, GripVertical, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurriculumSidebarProps {
    courseId: string;
    course: any;
    onRefresh: () => void;
    currentLessonId?: string;
}

export function CurriculumSidebar({ courseId, course, onRefresh, currentLessonId }: CurriculumSidebarProps) {
    const router = useRouter();

    // Chapter Dialog State
    const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState("");

    // Lesson Dialog State
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");

    const handleAddChapter = async () => {
        if (!newChapterTitle) return;
        try {
            await api.post(`/courses/${courseId}/chapters`, { title: newChapterTitle });
            setNewChapterTitle("");
            setIsChapterDialogOpen(false);
            onRefresh();
        } catch (error) {
            console.error("Failed to add chapter", error);
        }
    };

    const handleAddLesson = async () => {
        if (!newLessonTitle || !activeChapterId) return;
        try {
            await api.post(`/courses/${courseId}/lessons`, {
                title: newLessonTitle,
                duration: "0",
                chapterId: activeChapterId
            });

            setNewLessonTitle("");
            setIsLessonDialogOpen(false);
            onRefresh();
        } catch (error) {
            console.error("Failed to add lesson", error);
        }
    };

    return (
        <aside className="w-96 bg-muted/10 flex flex-col border-l h-full">
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
                {course?.chapters?.map((chapter: any) => (
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
                            {chapter.lessons?.map((lesson: any) => (
                                <div
                                    key={lesson.id}
                                    className={cn(
                                        "flex items-center justify-between p-2 rounded-sm cursor-pointer text-sm",
                                        currentLessonId === lesson.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                                    )}
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

                {/* Direct Lessons (Uncategorized) */}
                {(course as any)?.lessons?.length > 0 && (
                    <div className="border rounded-md bg-background">
                        <div className="p-3 bg-yellow-500/10 text-yellow-600 font-medium text-sm">
                            Uncategorized Lessons
                        </div>
                        <div className="p-2 space-y-1">
                            {(course as any).lessons.map((lesson: any) => (
                                <div
                                    key={lesson.id}
                                    className={cn(
                                        "p-2 rounded-sm text-sm cursor-pointer",
                                        currentLessonId === lesson.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                                    )}
                                    onClick={() => router.push(`/courses/${courseId}/${lesson.id}`)}
                                >
                                    {lesson.title}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

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
        </aside>
    );
}
