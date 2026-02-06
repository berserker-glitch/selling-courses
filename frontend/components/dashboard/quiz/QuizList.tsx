"use client";
// Force rebuild


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { quizService, Quiz } from "@/lib/services/quizService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const data = await quizService.getAll();
            setQuizzes(data);
        } catch (err) {
            setError("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await quizService.delete(id);
            setQuizzes(quizzes.filter(q => q.id !== id));
        } catch (err) {
            alert("Failed to delete quiz");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200">Beta</span>
                </div>
                <Button onClick={() => router.push("/quizzes/new")}>
                    <Plus className="mr-2 h-4 w-4" /> New Quiz
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="truncate">{quiz.title}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {quiz.description || "No description provided"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                <span>{quiz._count?.questions || 0} Questions</span>
                                <span>{new Date(quiz.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(`/quizzes/${quiz.id}`)}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(quiz.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {quizzes.length === 0 && (
                    <div className="col-span-full text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                        No quizzes found. Create your first quiz!
                    </div>
                )}
            </div>
        </div>
    );
}
