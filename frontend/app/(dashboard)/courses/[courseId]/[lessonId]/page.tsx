"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/RichTextEditor";

import { CourseBreadcrumb } from "@/components/dashboard/CourseBreadcrumb";
import { CurriculumSidebar } from "@/components/dashboard/CurriculumSidebar";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Type, Video, FileText, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentBlock {
    id: string;
    type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'DOCUMENT';
    title?: string;
    content: any;
    order: number;
}

export default function LessonEditorPage() {
    const { courseId, lessonId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);

    const [lesson, setLesson] = useState<any>(null);
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (courseId) {
            fetchData();
        }
    }, [courseId, lessonId]);

    const fetchData = async () => {
        try {
            const courseData = await api.get(`/courses/${courseId}`);
            setCourse(courseData);

            // Find lesson
            let foundLesson = null;
            if (courseData.chapters) {
                for (const ch of courseData.chapters) {
                    const l = ch.lessons.find((l: any) => l.id === lessonId);
                    if (l) { foundLesson = l; break; }
                }
            }
            if (!foundLesson && courseData.lessons) {
                foundLesson = courseData.lessons.find((l: any) => l.id === lessonId);
            }

            if (foundLesson) {
                setLesson(foundLesson);
                setBlocks(foundLesson.contentBlocks || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save order
                const updates = newItems.map((item, index) => ({ id: item.id, order: index }));
                api.put(`/lessons/${lessonId}/blocks/reorder`, { blocks: updates }).catch(console.error);

                return newItems;
            });
        }
    };

    const addBlock = async (type: ContentBlock['type']) => {
        try {
            const newBlock = await api.post(`/lessons/${lessonId}/blocks`, {
                type,
                title: type === 'TEXT' ? 'Text Content' : `New ${type}`,
                content: {}
            });
            setBlocks([...blocks, newBlock]);
        } catch (error) {
            console.error(error);
        }
    };

    const updateBlock = async (id: string, data: Partial<ContentBlock>) => {
        // Optimistic update
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...data } : b));
        try {
            await api.put(`/blocks/${id}`, data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteBlock = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/blocks/${id}`);
            setBlocks(blocks.filter(b => b.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;
    // if (!lesson) return <div>Lesson not found</div>; // Allow render if course loads but lesson is switching

    return (
        <div className="flex h-screen flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* Main Content - Lesson Editor */}
                <main className="flex-1 overflow-y-auto p-8 border-r bg-background">
                    <div className="max-w-3xl">
                        <CourseBreadcrumb
                            items={[
                                { label: course?.title || "Course", href: `/courses/${courseId}` },
                                { label: lesson?.title || "Loading..." }
                            ]}
                        />

                        {lesson ? (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h1 className="text-3xl font-bold">{lesson.title}</h1>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button><Plus className="mr-2 h-4 w-4" /> Add Content</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => addBlock('TEXT')}><Type className="mr-2 h-4 w-4" /> Text</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addBlock('VIDEO')}><Video className="mr-2 h-4 w-4" /> Video</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addBlock('QUIZ')}><HelpCircle className="mr-2 h-4 w-4" /> Quiz</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addBlock('DOCUMENT')}><FileText className="mr-2 h-4 w-4" /> Document</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={blocks.map(b => b.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-4">
                                            {blocks.map((block) => (
                                                <SortableBlock
                                                    key={block.id}
                                                    block={block}
                                                    onUpdate={updateBlock}
                                                    onDelete={deleteBlock}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                {blocks.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                                        No content yet. Click "Add Content" to start.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>Lesson not found</div>
                        )}
                    </div>
                </main>

                {/* Sidebar */}
                <CurriculumSidebar
                    courseId={courseId as string}
                    course={course}
                    onRefresh={fetchData}
                    currentLessonId={lessonId as string}
                />
            </div>
        </div>
    );
}

function SortableBlock({ block, onUpdate, onDelete }: { block: ContentBlock, onUpdate: any, onDelete: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card ref={setNodeRef} style={style} className="group">
            <CardContent className="p-4 flex gap-4">
                <div {...attributes} {...listeners} className="mt-2 cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <Input
                            value={block.title}
                            onChange={(e) => onUpdate(block.id, { title: e.target.value })}
                            className="font-semibold text-lg border-none px-0 h-auto focus-visible:ring-0"
                        />
                        <Button variant="ghost" size="icon" onClick={() => onDelete(block.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {block.type === 'TEXT' && (
                        <RichTextEditor
                            value={block.content?.html || ""}
                            onChange={(html) => onUpdate(block.id, { content: { ...block.content, html } })}
                        />
                    )}

                    {block.type === 'VIDEO' && (
                        <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                            <Label>Video ID (VdoCipher)</Label>
                            <Input
                                placeholder="Enter Video ID"
                                value={block.content?.videoId || ""}
                                onChange={(e) => onUpdate(block.id, { content: { ...block.content, videoId: e.target.value } })}
                            />
                        </div>
                    )}

                    {/* Placeholder for other types */}
                    {(block.type === 'QUIZ') && <div className="p-4 bg-muted rounded text-center">Quiz Editor Placeholder</div>}
                    {(block.type === 'DOCUMENT') && <div className="p-4 bg-muted rounded text-center">Document Upload Placeholder</div>}
                </div>
            </CardContent>
        </Card>
    )
}
