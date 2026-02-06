"use client";

import QuizEditor from '@/components/dashboard/quiz/QuizEditor';
import { useParams } from 'next/navigation';

export default function EditQuizPage() {
    const params = useParams();
    // params.quizId might be string or string[], safe to cast/check if needed but QuizEditor handles string prop
    const quizId = Array.isArray(params.quizId) ? params.quizId[0] : params.quizId;

    return (
        <div className="p-8 pb-20">
            <QuizEditor quizId={quizId} />
        </div>
    );
}
