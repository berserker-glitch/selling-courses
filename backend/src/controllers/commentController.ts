import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
    lessonId: z.string().uuid("Invalid Lesson ID")
});

export const getComments = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params;

        const comments = await prisma.comment.findMany({
            where: { lessonId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // Newest first
            }
        });

        res.json(comments);
    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

export const createComment = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { lessonId, content } = req.body;

        // Validate input
        createCommentSchema.parse({ lessonId, content });

        const comment = await prisma.comment.create({
            data: {
                content,
                lessonId,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        console.error('Create Comment Error:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
};
