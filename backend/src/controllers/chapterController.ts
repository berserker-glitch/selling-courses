import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createChapterSchema = z.object({
    title: z.string().min(1, "Title is required"),
});

const updateChapterSchema = z.object({
    title: z.string().min(1).optional(),
    order: z.number().int().optional(),
});

export const createChapter = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const user = (req as any).user;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = createChapterSchema.parse(req.body);

        const count = await prisma.chapter.count({ where: { courseId } });

        const chapter = await prisma.chapter.create({
            data: {
                title: data.title,
                courseId,
                order: count // 0-indexed based on count
            }
        });

        res.status(201).json(chapter);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error creating chapter' });
    }
};

export const updateChapter = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;
        const user = (req as any).user;

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { course: true }
        }) as any;
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        if (chapter.course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = updateChapterSchema.parse(req.body);

        const updated = await prisma.chapter.update({
            where: { id: chapterId },
            data
        });

        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error updating chapter' });
    }
};

export const deleteChapter = async (req: Request, res: Response) => {
    try {
        const { chapterId } = req.params;
        const user = (req as any).user;

        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: { course: true }
        }) as any;
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        if (chapter.course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.chapter.delete({ where: { id: chapterId } });

        res.json({ message: 'Chapter deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error deleting chapter' });
    }
};

export const reorderChapters = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const user = (req as any).user;
        const { chapters } = req.body as { chapters: { id: string; order: number }[] };

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Transactional update for safety
        await prisma.$transaction(
            chapters.map((ch) =>
                prisma.chapter.update({
                    where: { id: ch.id },
                    data: { order: ch.order }
                })
            )
        );

        res.json({ message: 'Chapters reordered' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error reordering chapters' });
    }
};
