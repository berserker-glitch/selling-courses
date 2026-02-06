import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Helper validator for content JSON structure based on type could be added here
const createBlockSchema = z.object({
    type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'DOCUMENT']),
    title: z.string().optional(),
    content: z.any().optional(), // Flexible JSON
});

const updateBlockSchema = z.object({
    type: z.enum(['TEXT', 'VIDEO', 'QUIZ', 'DOCUMENT']).optional(),
    title: z.string().optional(),
    content: z.any().optional(),
    order: z.number().int().optional(),
});

export const createContentBlock = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const user = (req as any).user;

        // Verify lesson and ownership
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: true
            }
        }) as any;

        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        // Check ownership via course
        if (lesson.course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = createBlockSchema.parse(req.body);

        const count = await prisma.contentBlock.count({ where: { lessonId } });

        const block = await prisma.contentBlock.create({
            data: {
                lessonId,
                type: data.type,
                title: data.title,
                content: data.content,
                order: count
            }
        });

        res.status(201).json(block);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error creating content block' });
    }
};

export const updateContentBlock = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;
        const user = (req as any).user;

        const block = await prisma.contentBlock.findUnique({
            where: { id: blockId },
            include: { lesson: { include: { course: true } } }
        });

        if (!block) return res.status(404).json({ message: 'Block not found' });

        if (block.lesson.course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = updateBlockSchema.parse(req.body);

        const updated = await prisma.contentBlock.update({
            where: { id: blockId },
            data
        });

        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error updating block' });
    }
};

export const deleteContentBlock = async (req: Request, res: Response) => {
    try {
        const { blockId } = req.params;
        const user = (req as any).user;

        const block = await prisma.contentBlock.findUnique({
            where: { id: blockId },
            include: { lesson: { include: { course: true } } }
        });

        if (!block) return res.status(404).json({ message: 'Block not found' });

        if (block.lesson.course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.contentBlock.delete({ where: { id: blockId } });

        res.json({ message: 'Block deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error deleting block' });
    }
};

export const reorderContentBlocks = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;
        const user = (req as any).user;
        const { blocks } = req.body as { blocks: { id: string; order: number }[] };

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { course: true }
        }) as any;

        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        if (lesson.course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.$transaction(
            blocks.map((b) =>
                prisma.contentBlock.update({
                    where: { id: b.id },
                    data: { order: b.order }
                })
            )
        );

        res.json({ message: 'Blocks reordered' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error reordering blocks' });
    }
};
