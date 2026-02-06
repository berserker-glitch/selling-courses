/**
 * Socket.io service for real-time session management.
 * Handles user connections and provides methods for force-logout broadcasts.
 * 
 * @module socketService
 * @description Manages WebSocket connections for session invalidation across devices
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

// Map userId to their connected socket IDs for targeted force-logout
const userSockets: Map<string, Set<string>> = new Map();

// Singleton Socket.io server instance
let io: SocketIOServer | null = null;

/**
 * Initialize the Socket.io server and set up connection handlers.
 * 
 * @param {HTTPServer} httpServer - The HTTP server to attach Socket.io to
 * @returns {SocketIOServer} The initialized Socket.io server instance
 */
export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
    console.log('[SocketService] Initializing Socket.io server...');

    // SECURITY: Restrict CORS to same origins allowed by REST API
    const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:8080',
        'http://192.168.1.102:8080',
        'http://192.168.1.102:5173'
    ];

    io = new SocketIOServer(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SocketService] New socket connection: ${socket.id}`);

        // Authenticate user from handshake token
        const token = socket.handshake.auth.token;

        if (token) {
            try {
                // Verify JWT and extract user ID
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
                const userId = decoded.id;

                console.log(`[SocketService] Socket ${socket.id} authenticated for user: ${userId}`);

                // Add socket to user's connection set
                if (!userSockets.has(userId)) {
                    userSockets.set(userId, new Set());
                }
                userSockets.get(userId)!.add(socket.id);

                console.log(`[SocketService] User ${userId} now has ${userSockets.get(userId)!.size} active socket(s)`);

                // Messaging: Join conversation rooms
                socket.on('join-conversation', (conversationId: string) => {
                    socket.join(conversationId);
                    console.log(`[SocketService] Socket ${socket.id} joined conversation: ${conversationId}`);
                });

                // Messaging: Leave conversation rooms
                socket.on('leave-conversation', (conversationId: string) => {
                    socket.leave(conversationId);
                    console.log(`[SocketService] Socket ${socket.id} left conversation: ${conversationId}`);
                });

                // Messaging: Handle outgoing messages from client
                socket.on('send-message', async (data: { conversationId: string; text: string }) => {
                    const { conversationId, text } = data;
                    try {
                        const message = await prisma.message.create({
                            data: {
                                conversationId,
                                senderId: userId,
                                text
                            },
                            include: {
                                sender: {
                                    select: { id: true, name: true, role: true }
                                }
                            }
                        });

                        // Update conversation timestamp
                        await prisma.conversation.update({
                            where: { id: conversationId },
                            data: { updatedAt: new Date() }
                        });

                        // Broadcast to everyone in the room (including sender)
                        console.log(`[SocketService] Broadcasting new message in room ${conversationId} from user ${userId}`);
                        io?.to(conversationId).emit('new-message', message);
                    } catch (error) {
                        console.error('[SocketService] Error sending message via socket:', error);
                        socket.emit('error', { message: 'Failed to send message' });
                    }
                });

                // Messaging: Handle typing status
                socket.on('typing', (data: { conversationId: string; typing: boolean }) => {
                    console.log(`[SocketService] User ${userId} typing status in room ${data.conversationId}: ${data.typing}`);
                    socket.to(data.conversationId).emit('user-typing', {
                        userId,
                        typing: data.typing
                    });
                });

                // Handle disconnection - remove socket from user's set
                socket.on('disconnect', () => {
                    console.log(`[SocketService] Socket ${socket.id} disconnected`);
                    userSockets.get(userId)?.delete(socket.id);

                    // Clean up empty sets
                    if (userSockets.get(userId)?.size === 0) {
                        userSockets.delete(userId);
                    }
                });
            } catch (err) {
                console.log(`[SocketService] Socket ${socket.id} failed authentication - disconnecting`);
                socket.disconnect();
            }
        } else {
            console.log(`[SocketService] Socket ${socket.id} has no auth token - disconnecting`);
            socket.disconnect();
        }
    });

    console.log('[SocketService] Socket.io server initialized successfully');
    return io;
}

/**
 * Force logout all connected sockets for a specific user.
 * Called when session limit is exceeded on new login.
 * 
 * @param {string} userId - The ID of the user to force logout
 * @param {string} [reason] - Optional reason message to send to clients
 */
export function forceLogoutUser(userId: string, reason?: string): void {
    if (!io) {
        console.warn('[SocketService] Cannot force logout - Socket.io not initialized');
        return;
    }

    const sockets = userSockets.get(userId);
    const logoutMessage = reason || 'Device limit exceeded. You have been logged out on all devices.';

    if (sockets && sockets.size > 0) {
        console.log(`[SocketService] Force logging out ${sockets.size} socket(s) for user: ${userId}`);

        // Emit force-logout event to each of the user's connected sockets
        sockets.forEach((socketId) => {
            io!.to(socketId).emit('force-logout', {
                reason: logoutMessage
            });
            console.log(`[SocketService] Sent force-logout to socket: ${socketId}`);
        });

        // Clear all sockets for this user
        userSockets.delete(userId);
        console.log(`[SocketService] Cleared all sockets for user: ${userId}`);
    } else {
        console.log(`[SocketService] No active sockets found for user: ${userId}`);
    }
}

/**
 * Get the current Socket.io server instance.
 * 
 * @returns {SocketIOServer | null} The Socket.io server instance or null if not initialized
 */
export function getIO(): SocketIOServer | null {
    return io;
}

/**
 * Get the count of active socket connections for a user.
 * Useful for debugging and monitoring.
 * 
 * @param {string} userId - The ID of the user to check
 * @returns {number} The number of active socket connections
 */
export function getUserSocketCount(userId: string): number {
    return userSockets.get(userId)?.size || 0;
}
