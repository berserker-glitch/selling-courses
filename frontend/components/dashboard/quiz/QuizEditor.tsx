"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quizService, Quiz, Question, QuestionOption } from "@/lib/services/quizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { Loader2, Plus, Trash, ArrowLeft } from "lucide-react";

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

    const handleRemoveQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleAddOption = (questionIndex: number) => {
        const newQuestions = [...questions];
        const currentOptions = newQuestions[questionIndex].options || [];
        newQuestions[questionIndex].options = [
            ...currentOptions,
            { text: `Option ${currentOptions.length + 1}`, isCorrect: false }
        ];
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, field: keyof QuestionOption, value: any) => {
        const newQuestions = [...questions];
        if (!newQuestions[qIndex].options) return;

        // If setting isCorrect to true, verify single choice logic (optional, currently allowing multiple correct implies checkbox style, but UI below uses Radio for single choice visual - let's assume single correct answer for now OR handle logic)
        // For simplicity, if user sets one option correct, we can unset others if we want single-choice. 
        // Let's stick to simple flexible boolean for now.

        newQuestions[qIndex].options![oIndex] = {
            ...newQuestions[qIndex].options![oIndex],
            [field]: value
        };
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        if (!newQuestions[qIndex].options) return;
        newQuestions[qIndex].options!.splice(oIndex, 1);
        setQuestions(newQuestions);
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

                {questions.map((question, qIndex) => (
                    <Card key={qIndex} className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-destructive hover:text-destructive/90"
                            onClick={() => handleRemoveQuestion(qIndex)}
                        >
                            <Trash className="w-4 h-4" />
                        </Button>

                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label>Question Text</Label>
                                <Input
                                    value={question.text}
                                    onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Answer Type</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`q-type-${qIndex}`}
                                            checked={question.type === 'MULTIPLE_CHOICE'}
                                            onChange={(e) => updateQuestion(qIndex, 'type', e.target.checked ? 'MULTIPLE_CHOICE' : 'TEXT')}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`q-type-${qIndex}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Multiple Choice</label>
                                    </div>
                                </div>
                            </div>

                            {question.type === 'MULTIPLE_CHOICE' && (
                                <div className="space-y-3 pl-4 border-l-2 border-muted">
                                    <Label>Options</Label>
                                    {question.options?.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={option.isCorrect}
                                                onChange={(e) => updateOption(qIndex, oIndex, "isCorrect", e.target.checked)}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <Input
                                                value={option.text}
                                                onChange={(e) => updateOption(qIndex, oIndex, "text", e.target.value)}
                                                className="flex-1"
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                                                <Trash className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" onClick={() => handleAddOption(qIndex)} className="mt-2">
                                        <Plus className="w-3 h-3 mr-2" /> Add Option
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
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
