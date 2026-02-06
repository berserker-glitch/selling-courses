"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quizService, Quiz, Question, QuestionOption } from "@/lib/services/quizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { QuestionItem } from "./QuestionItem";
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

interface QuizEditorProps {
    quizId?: string; // If undefined, new quiz
}

export default function QuizEditor({ quizId }: QuizEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex((i) => (i.id || `temp-${items.indexOf(i)}`) === active.id);
                const newIndex = items.findIndex((i) => (i.id || `temp-${items.indexOf(i)}`) === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    useEffect(() => {
        if (quizId) {
            loadQuiz(quizId);
        }
    }, [quizId]);

    const loadQuiz = async (id: string) => {
        setLoading(true);
        try {
            const data = await quizService.getById(id);
            setTitle(data.title);
            setDescription(data.description || "");
            setQuestions(data.questions || []);
        } catch (err) {
            setError("Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "New Question",
                type: "MULTIPLE_CHOICE",
                options: [
                    { text: "Option 1", isCorrect: true },
                    { text: "Option 2", isCorrect: false }
                ]
            }
        ]);
    };


    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                title,
                description,
                questions
            };

            if (quizId) {
                await quizService.update(quizId, payload);
            } else {
                await quizService.create(payload);
            }
            router.push("/quizzes");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save quiz");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/quizzes")}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">{quizId ? "Edit Quiz" : "Create New Quiz"}</h1>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Introduction to React"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the quiz..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
                    <Button onClick={handleAddQuestion} variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={questions.map((q, i) => q.id || `temp-${i}`)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {questions.map((question, qIndex) => (
                                <SortableQuestionItem
                                    key={question.id || `temp-${qIndex}`}
                                    id={question.id || `temp-${qIndex}`}
                                    question={question}
                                    index={qIndex}
                                    onUpdate={(field: keyof Question, value: any) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
                                        setQuestions(newQuestions);
                                    }}
                                    onRemove={() => {
                                        const newQuestions = [...questions];
                                        newQuestions.splice(qIndex, 1);
                                        setQuestions(newQuestions);
                                    }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex justify-end gap-4 container max-w-4xl mx-auto z-10">
                <Button variant="outline" onClick={() => router.push("/quizzes")} disabled={saving}>
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Quiz
                </Button>
            </div>
        </div>
    );
}

function SortableQuestionItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <QuestionItem {...props} />
        </div>
    );
}
