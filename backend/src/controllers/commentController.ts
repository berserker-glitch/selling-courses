import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
    lessonId: z.string().uuid("Invalid Lesson ID")
});

export const getComments = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.params as { lessonId: string };

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
            const zodError = error as any;
            return res.status(400).json({ message: zodError.errors?.[0]?.message || 'Validation error' });
        }
        console.error('Create Comment Error:', error);
        res.status(500).json({ message: 'Error creating comment' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const requestingUser = (req as any).user;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { user: true } // Include user to check ownership if needed
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Allow delete if:
        // 1. User is the author
        // 2. User is TEACHER or ADMIN
        const isAuthor = comment.userId === requestingUser.id;
        const isAdminOrTeacher = ['ADMIN', 'TEACHER'].includes(requestingUser.role);

        if (!isAuthor && !isAdminOrTeacher) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
};
