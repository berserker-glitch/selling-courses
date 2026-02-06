import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Schemas
const questionOptionSchema = z.object({
    id: z.string().optional(), // For updates
    text: z.string().min(1),
    isCorrect: z.boolean().default(false)
});

const questionSchema = z.object({
    id: z.string().optional(), // For updates
    text: z.string().min(1),
    type: z.enum(['MULTIPLE_CHOICE', 'TEXT']),
    options: z.array(questionOptionSchema).optional()
});

const createQuizSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    questions: z.array(questionSchema).optional()
});

const updateQuizSchema = createQuizSchema.partial();

// --- Quiz Handlers ---

export const getQuizzes = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let where: any = {};

        // If teacher, only show their quizzes
        if (user.role === 'TEACHER') {
            where.teacherId = user.id;
        }
        // Students typically don't list quizzes directly, but via lessons.
        // If needed for admin, they see all.

        const quizzes = await prisma.quiz.findMany({
            where,
            include: {
                _count: { select: { questions: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(quizzes);
    } catch (error) {
        console.error('Get Quizzes Error:', error);
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quizId = Array.isArray(id) ? id[0] : id; // Handle potential array

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        options: true
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Get Quiz Error:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only teachers can create quizzes' });
        }

        const data = createQuizSchema.parse(req.body);

        // Transactional creation of quiz and questions
        const quiz = await prisma.$transaction(async (tx) => {
            const newQuiz = await tx.quiz.create({
                data: {
                    title: data.title,
                    description: data.description,
                    teacherId: user.id
                }
            });

            if (data.questions && data.questions.length > 0) {
                for (let i = 0; i < data.questions.length; i++) {
                    const q = data.questions[i];
                    await tx.question.create({
                        data: {
                            quizId: newQuiz.id,
                            text: q.text,
                            type: q.type,
                            order: i, // Maintain order
                            options: {
                                create: q.options?.map(opt => ({
                                    text: opt.text,
                                    isCorrect: opt.isCorrect
                                }))
                            }
                        }
                    });
                }
            }

            return newQuiz;
        });

        // Fetch complete quiz to return
        const fullQuiz = await prisma.quiz.findUnique({
            where: { id: quiz.id },
            include: { questions: { include: { options: true } } }
        });

        res.status(201).json(fullQuiz);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            // ZodError has .issues, some versions have .errors. Safe access.
            const issues = (error as any).issues || (error as any).errors;
            console.log('Validation Error:', issues);
            return res.status(400).json({ message: 'Validation error', errors: issues });
        }
        console.error('Create Quiz Error:', error);
        res.status(400).json({ message: error.message || 'Error creating quiz' });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quizId = Array.isArray(id) ? id[0] : id;
        const user = (req as any).user;

        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (quiz.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = updateQuizSchema.parse(req.body);

        // Simple property updates
        await prisma.quiz.update({
            where: { id: quizId },
            data: {
                title: data.title,
                description: data.description
            }
        });

        // Question handling is complex for update. 
        // Strategy: If questions are provided, we might need to upsert, delete, or recreate.
        // For simplicity in this iteration: 
        // If questions array is not provided, do nothing to questions.
        // If provided, we'll replace or intelligently update. 

        // Let's adopt a "replace all questions" strategy if 'questions' field is present for simplicity first,
        // or a granular management via separate endpoints could be better.
        // Given the requirement "making questions adding questions", a full update seems plausible for a focused editor.

        if (data.questions) {
            await prisma.$transaction(async (tx) => {
                // Delete existing questions (and cascade options)
                await tx.question.deleteMany({ where: { quizId: quizId } });

                // Re-create
                for (let i = 0; i < data.questions!.length; i++) {
                    const q = data.questions![i];
                    await tx.question.create({
                        data: {
                            quizId: quizId,
                            text: q.text,
                            type: q.type,
                            order: i,
                            options: {
                                create: q.options?.map(opt => ({
                                    text: opt.text,
                                    isCorrect: opt.isCorrect
                                }))
                            }
                        }
                    });
                }
            });
        }

        const updatedQuiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: { include: { options: true } } }
        });

        res.json(updatedQuiz);
    } catch (error: any) {
        console.error('Update Quiz Error:', error);
        res.status(400).json({ message: error.message || 'Error updating quiz' });
    }
};

export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quizId = Array.isArray(id) ? id[0] : id;
        const user = (req as any).user;

        const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (quiz.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.quiz.delete({ where: { id: quizId } });
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz' });
    }
};
