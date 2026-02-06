import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { getIO } from '../services/socketService';

/**
 * Get all conversations for the current user
 */
export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const participants = await prisma.participant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        role: true
                                    }
                                }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        const conversations = participants.map(p => p.conversation);
        res.json(conversations);
    } catch (error: any) {
        console.error('[MessageController] getConversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
};

/**
 * Get messages for a specific conversation
 */
export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = (req as any).user.id;

        // Verify participation
        const participant = await prisma.participant.findFirst({
            where: { conversationId, userId }
        });

        if (!participant) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (error: any) {
        console.error('[MessageController] getMessages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
};

/**
 * Start a new conversation or get existing one with an Admin
 * Used by students to initiate contact.
 */
export const startConversationWithAdmin = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).user.id;

        // Find an admin. In this simple case, we pick the first one.
        // Scalability: We could distribute students among admins or have a shared queue.
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!admin) {
            return res.status(404).json({ message: 'No admin available at the moment' });
        }

        // Check for existing 1:1 conversation between these specific users
        // This is a simplified check
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                participants: {
                    every: {
                        userId: { in: [studentId, admin.id] }
                    }
                }
            },
            include: {
                participants: true
            }
        });

        if (existingConversation && existingConversation.participants.length === 2) {
            return res.json(existingConversation);
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: studentId },
                        { userId: admin.id }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json(conversation);
    } catch (error: any) {
        console.error('[MessageController] startConversation error:', error);
        res.status(500).json({ message: 'Failed to start conversation', error: error.message });
    }
};

/**
 * Send a message via REST (fallback or initial message)
 */
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId, text } = req.body;
        const senderId = (req as any).user.id;

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                text
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        // Broadcast via socket if possible
        const io = getIO();
        if (io) {
            io.to(conversationId).emit('new-message', message);
        }

        res.status(201).json(message);
    } catch (error: any) {
        console.error('[MessageController] sendMessage error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};
