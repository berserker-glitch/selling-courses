"use client";

import { Question, QuestionOption } from "@/lib/services/quizService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash, Plus, GripVertical, Check } from "lucide-react";

interface QuestionItemProps {
    question: Question;
    index: number;
    onUpdate: (field: keyof Question, value: any) => void;
    onRemove: () => void;
}

export function QuestionItem({ question, index, onUpdate, onRemove }: QuestionItemProps) {

    const updateOption = (oIndex: number, field: keyof QuestionOption, value: any) => {
        if (!question.options) return;
        const newOptions = [...question.options];
        newOptions[oIndex] = { ...newOptions[oIndex], [field]: value };


        onUpdate('options', newOptions);
    };

    const addOption = () => {
        const currentOptions = question.options || [];
        onUpdate('options', [
            ...currentOptions,
            { text: `Option ${currentOptions.length + 1}`, isCorrect: false }
        ]);
    };

    const removeOption = (oIndex: number) => {
        if (!question.options) return;
        const newOptions = [...question.options];
        newOptions.splice(oIndex, 1);
        onUpdate('options', newOptions);
    };

    return (
        <Card className="relative group">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground opacity-50 group-hover:opacity-100">
                <GripVertical className="w-5 h-5" />
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                onClick={onRemove}
            >
                <Trash className="w-4 h-4" />
            </Button>

            <CardContent className="pt-6 pl-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-2">
                        <Label>Question Text</Label>
                        <Input
                            value={question.text}
                            onChange={(e) => onUpdate("text", e.target.value)}
                            placeholder="Enter question..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={question.type}
                            onChange={(e) => {
                                const newType = e.target.value as any;
                                let newOptions = question.options;

                                // Default options for types
                                if (!newOptions || newOptions.length === 0) {
                                    newOptions = [
                                        { text: "Option 1", isCorrect: false },
                                        { text: "Option 2", isCorrect: false }
                                    ];
                                }

                                onUpdate('type', newType);
                                onUpdate('options', newOptions);
                            }}
                        >
                            <option value="MULTIPLE_CHOICE">Choice</option>
                            <option value="TEXT">Short Answer</option>
                        </select>
                    </div>
                </div>

                {/* Options Area */}
                {question.type !== 'TEXT' && (
                    <div className="space-y-3 pl-4 border-l-2 border-muted mt-4">
                        <Label className="text-xs uppercase text-muted-foreground tracking-wider">Answer Options</Label>

                        {question.options?.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                                <div className="flex-shrink-0 pt-1">
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => updateOption(oIndex, "isCorrect", e.target.checked)}
                                        className="w-4 h-4 accent-primary cursor-pointer"
                                    />
                                </div>
                                <Input
                                    value={option.text}
                                    onChange={(e) => updateOption(oIndex, "text", e.target.value)}
                                    className="flex-1"
                                    placeholder={`Option ${oIndex + 1}`}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeOption(oIndex)}>
                                    <Trash className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </div>
                        ))}

                        <Button variant="ghost" size="sm" onClick={addOption} className="mt-2 text-muted-foreground hover:text-foreground">
                            <Plus className="w-3 h-3 mr-2" /> Add Option
                        </Button>

                        <div className="text-xs text-muted-foreground mt-2">
                            Select the checkbox next to the correct answer(s).
                        </div>
                    </div>
                )}

                {question.type === 'TEXT' && (
                    <div className="p-4 bg-muted/30 rounded-md text-sm text-muted-foreground">
                        Short answer questions are manually graded or checked against keywords (future feature).
                        You can add model answers below if needed.
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
