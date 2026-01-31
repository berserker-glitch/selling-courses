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

        // Upsert lesson progress
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
            },
            include: {
                lesson: true  // Include lesson to get courseId
            }
        });

        // Recalculate course progress if lesson was completed
        if (completed && progress.lesson) {
            const courseId = progress.lesson.courseId;

            // Get total lessons in course
            const totalLessons = await prisma.lesson.count({
                where: { courseId }
            });

            // Get completed lessons for this user in this course
            const completedLessons = await prisma.lessonProgress.count({
                where: {
                    userId: user.id,
                    completed: true,
                    lesson: { courseId }
                }
            });

            // Calculate progress percentage
            const progressPercentage = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            // Update enrollment with new progress
            await prisma.enrollment.updateMany({
                where: {
                    userId: user.id,
                    courseId
                },
                data: {
                    progress: progressPercentage,
                    completed: progressPercentage === 100
                }
            });

            // Log lesson completion
            await logAudit(user.id, 'LESSON_COMPLETE', {
                lessonId,
                courseId,
                progressPercentage
            }, req);
        }

        res.json(progress);
    } catch (error: any) {
        console.error('Progress update error:', error);
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
