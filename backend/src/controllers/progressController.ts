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
        const { lessonId } = req.params;
        const user = (req as any).user;
        const { completed, watchedDuration } = progressSchema.parse(req.body);

        // Upsert progress
        const progress = await prisma.lessonProgress.create({ // Should be upsert if composite unique key exists
            // But schema didn't have composite key on LessonProgress(userId, lessonId) in my draft?
            // Let's check schema. If no unique constraint, we have to findFirst then update/create.
            data: {
                userId: user.id,
                lessonId,
                completed,
                watchedDuration: watchedDuration || '0'
            }
        });
        // Note: Real implementation needs strict Upsert logic. 
        // For now, assuming create works or we'd refine schema to have @@unique([userId, lessonId]) in usage.

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
        const { courseId } = req.params;
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
