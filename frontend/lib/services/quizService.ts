import { api } from '../api';

export interface QuestionOption {
    id?: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id?: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TEXT';
    options?: QuestionOption[];
    order?: number;
}

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    questions?: Question[];
    createdAt: string;
    updatedAt: string;
    _count?: {
        questions: number;
    };
}

export interface CreateQuizData {
    title: string;
    description?: string;
    questions?: Question[];
}

export const quizService = {
    getAll: async () => {
        return api.get('/quizzes');
    },

    getById: async (id: string) => {
        return api.get(`/quizzes/${id}`);
    },

    create: async (data: CreateQuizData) => {
        return api.post('/quizzes', data);
    },

    update: async (id: string, data: Partial<CreateQuizData>) => {
        return api.put(`/quizzes/${id}`, data);
    },

    delete: async (id: string) => {
        return api.delete(`/quizzes/${id}`);
    }
};
