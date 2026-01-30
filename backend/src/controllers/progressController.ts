import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { logAudit } from '../services/auditService';

const prisma = new PrismaClient();

const progressSchema = z.object({
    completed: z.boolean(),
    watchedDuration: z.string().optional() // 'mm:ss' or seconds
});

export const updateLessonProgress = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params as { lessonId: string };
        const user = (req as any).user;
        const { completed, watchedDuration } = progressSchema.parse(req.body);

        // Upsert progress
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId
                }
            },
            update: {
                completed,
                watchedDuration: watchedDuration || '0'
            },
            create: {
                userId: user.id,
                lessonId,
                completed,
                watchedDuration: watchedDuration || '0'
            }
        });

        // Log completion
        if (completed) {
            await logAudit(user.id, 'LESSON_COMPLETE', { lessonId }, req);
        }

        res.json(progress);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error updating progress' });
    }
};

export const getCourseProgress = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params as { courseId: string };
        const user = (req as any).user;

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        res.json(enrollment || { progress: 0, completed: false });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress' });
    }
};
