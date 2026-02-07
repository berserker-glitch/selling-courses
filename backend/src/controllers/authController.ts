import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { forceLogoutUser } from '../services/socketService';
import prisma from '../lib/prisma';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['STUDENT', 'TEACHER']).optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role || 'STUDENT' }
        });

        // Create Session
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'REGISTER',
                ip: req.ip || undefined,
                userAgent: req.headers['user-agent'] as string | undefined
            }
        });

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                deviceId: req.headers['user-agent'] || 'unknown', // Simple fingerprint for now
                expiresAt
            }
        });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        let { email, password } = loginSchema.parse(req.body);
        email = email.trim();
        password = password.trim();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log(`Login failed: User ${email} not found`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for ${email}`);
            // console.log('Provided:', password); // Be careful with logging passwords in prod, ok for local debug
            // console.log('Stored Hash:', user.password);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.suspended) {
            console.log(`Login blocked: User ${email} is suspended`);
            return res.status(403).json({ message: 'Your account has been suspended. Please contact the administrator.' });
        }

        const deviceId = (req.headers['x-device-id'] as string) || (req.headers['user-agent'] || 'unknown');

        // Device Binding Enforcement for Students
        if (user.role === 'STUDENT') {
            // Check if user has a bound device
            if (user.boundDeviceId) {
                if (user.boundDeviceId !== deviceId) {
                    console.log(`[Auth] Login blocked: Device mismatch for ${user.email}. Expected ${user.boundDeviceId}, got ${deviceId}`);

                    // Audit the attempt
                    await prisma.auditLog.create({
                        data: {
                            userId: user.id,
                            action: 'LOGIN_BLOCKED_DEVICE_MISMATCH',
                            metadata: { expected: user.boundDeviceId, actual: deviceId },
                            ip: req.ip || undefined,
                            userAgent: req.headers['user-agent'] as string | undefined
                        }
                    });

                    return res.status(401).json({
                        message: 'This account is bound to another device. Please contact support to reset your device binding.'
                    });
                }
            } else {
                // First time login with this implementation - Bind the device
                // Only bind if it's a valid UUID (to avoid binding to 'unknown' or user-agent if header missing) or just bind whatever comes?
                // Let's bind whatever comes if it's not 'unknown'.
                if (deviceId !== 'unknown') {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { boundDeviceId: deviceId }
                    });
                    console.log(`[Auth] Device bound for ${user.email}: ${deviceId}`);
                }
            }

            const activeSessions = await prisma.session.count({ where: { userId: user.id } });

            console.log(`[Auth] User ${email} has ${activeSessions} active session(s), maxDevices: ${user.maxDevices}`);

            // If login would exceed limit, invalidate ALL sessions and force-logout connected devices
            if (activeSessions >= user.maxDevices) {
                console.log(`[Auth] Device limit exceeded for ${email} - force logging out all devices`);

                // Force logout all connected devices via Socket.io (immediate client-side logout)
                forceLogoutUser(user.id, 'Device limit exceeded. You have been logged out on all devices.');

                // Delete all existing sessions from database
                await prisma.session.deleteMany({ where: { userId: user.id } });

                // Log the security event
                await prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: 'DEVICE_LIMIT_EXCEEDED',
                        metadata: { activeSessions, maxDevices: user.maxDevices },
                        ip: req.ip || undefined,
                        userAgent: req.headers['user-agent'] as string | undefined
                    }
                });
            }
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                deviceId: deviceId, // Use the resolved device ID
                expiresAt
            }
        });

        const loggedInUser = await prisma.user.findUnique({ where: { id: user.id } }); // Re-fetch to get boundDeviceId if just updated

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                ip: req.ip || undefined,
                userAgent: req.headers['user-agent'] as string | undefined
            }
        });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Server error' });
    }
};

export const getMe = async (req: any, res: Response) => {
    res.json(req.user);
};

// --- Student Creation (Teacher Only) ---

import { sendStudentCredentials } from '../services/emailService';

export const createStudent = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only teachers can create student accounts' });
        }

        const schema = z.object({
            name: z.string().min(2),
            email: z.string().email(),
            phoneNumber: z.string().optional(),
            password: z.string().optional(),
            categoryId: z.string().optional()
        });

        const { name, email, phoneNumber, password: manualPassword, categoryId } = schema.parse(req.body);

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Determine password (manual or generated)
        let password = manualPassword;
        if (!password || password.trim() === '') {
            password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const student = await prisma.user.create({
            data: {
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                role: 'STUDENT',
                // If categoryId is provided, connect it
                enrolledCategories: categoryId ? {
                    connect: { id: categoryId }
                } : undefined
            }
        });

        // Send Email
        // We always send the email with the password (either manual or generated)
        const emailSent = await sendStudentCredentials(email, name, password);

        if (!emailSent) {
            return res.status(201).json({
                message: 'Student created but email failed to send. Please ask the student to use the "Forgot Password" feature.',
                student: { id: student.id, email: student.email }
            });
        }

        res.status(201).json({ message: 'Student created and email sent successfully' });

    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error creating student' });
    }
};
// --- User Management ---

export const getUsers = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        // Verify admin or teacher
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { role } = req.query;

        const whereClause: any = {};
        if (role) {
            whereClause.role = role;
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                maxDevices: true, // Include device limit in user list
                createdAt: true,
                enrolledCategories: {
                    select: { id: true }
                }
            }
        });

        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// --- Device Limit Management ---

/**
 * Update the maximum devices allowed for a student.
 * Only accessible by TEACHER or ADMIN roles.
 * 
 * @route PUT /api/auth/users/:userId/device-limit
 * @param {string} userId - The ID of the user to update
 * @param {number} maxDevices - The new device limit (1-10)
 */
export const updateDeviceLimit = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const { maxDevices } = req.body;

        // Validate input - maxDevices must be between 1 and 10
        if (!maxDevices || maxDevices < 1 || maxDevices > 10) {
            return res.status(400).json({
                message: 'maxDevices must be between 1 and 10'
            });
        }

        // Validate userId
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Check if requesting user is TEACHER/ADMIN
        const requestingUser = (req as any).user;
        if (!['TEACHER', 'ADMIN'].includes(requestingUser.role)) {
            return res.status(403).json({
                message: 'Only teachers can update device limits'
            });
        }

        // Verify target user exists and is a student
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (targetUser.role !== 'STUDENT') {
            return res.status(400).json({ message: 'Device limits can only be set for students' });
        }

        // Update user's maxDevices
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { maxDevices },
            select: { id: true, name: true, email: true, maxDevices: true }
        });

        console.log(`[Auth] Device limit updated for ${updatedUser.email}: ${maxDevices} devices`);

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: requestingUser.id,
                action: 'UPDATE_DEVICE_LIMIT',
                metadata: { targetUserId: userId, newLimit: maxDevices },
                ip: req.ip || undefined,
                userAgent: req.headers['user-agent'] as string | undefined
            }
        });

        res.json(updatedUser);
    } catch (error: any) {
        console.error('[Auth] Error updating device limit:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

/**
 * Unbind a student's device, allowing them to login from a new device.
 * Only accessible by TEACHER or ADMIN roles.
 * 
 * @route POST /api/auth/users/:userId/unbind-device
 */
export const unbindDevice = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;

        // Check if requesting user is TEACHER/ADMIN
        const requestingUser = (req as any).user;
        if (!['TEACHER', 'ADMIN'].includes(requestingUser.role)) {
            return res.status(403).json({
                message: 'Only teachers can unbind devices'
            });
        }

        // Verify target user exists and is a student
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (targetUser.role !== 'STUDENT') {
            return res.status(400).json({ message: 'Device binding only applies to students' });
        }

        // Clear boundDeviceId
        await prisma.user.update({
            where: { id: userId },
            data: { boundDeviceId: null }
        });

        // Force logout user from all devices to ensure they re-bind on next login
        await prisma.session.deleteMany({ where: { userId: userId } });
        forceLogoutUser(userId, 'Your device binding has been reset by an administrator. Please log in again to bind your new device.');

        console.log(`[Auth] Device unbound for ${targetUser.email} by ${requestingUser.email}`);

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: requestingUser.id,
                action: 'UNBIND_DEVICE',
                metadata: { targetUserId: userId },
                ip: req.ip || undefined,
                userAgent: req.headers['user-agent'] as string | undefined
            }
        });

        res.json({ message: 'Device unbound successfully' });
    } catch (error: any) {
        console.error('[Auth] Error unbinding device:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};



/**
 * Toggle user suspension status.
 * Only accessible by TEACHER or ADMIN roles.
 * 
 * @route POST /api/auth/users/:userId/toggle-suspension
 */
export const toggleSuspension = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;

        // Check permissions
        const requestingUser = (req as any).user;
        if (!['TEACHER', 'ADMIN'].includes(requestingUser.role)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newStatus = !user.suspended;

        await prisma.user.update({
            where: { id: userId },
            data: { suspended: newStatus }
        });

        if (newStatus) {
            // Force logout if suspending
            await prisma.session.deleteMany({ where: { userId } });
            forceLogoutUser(userId, 'Your account has been suspended by an administrator.');
        }

        console.log(`[Auth] User ${user.email} suspension status set to ${newStatus} by ${requestingUser.email}`);

        // Audit log
        await prisma.auditLog.create({
            data: {
                userId: requestingUser.id,
                action: newStatus ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
                metadata: { targetUserId: userId },
                ip: req.ip || undefined,
                userAgent: req.headers['user-agent'] as string | undefined
            }
        });

        res.json({ message: `User ${newStatus ? 'suspended' : 'unsuspended'} successfully`, suspended: newStatus });
    } catch (error: any) {
        console.error('[Auth] Error toggling suspension:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// --- Category Enrollment ---

export const enrollStudentInCategory = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { studentId, categoryId } = req.body;

        if (!studentId || !categoryId) {
            return res.status(400).json({ message: 'Student ID and Category ID are required' });
        }

        // Verify student exists
        const student = await prisma.user.findUnique({ where: { id: studentId } });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Connect category
        await prisma.user.update({
            where: { id: studentId },
            data: {
                enrolledCategories: {
                    connect: { id: categoryId }
                }
            }
        });

        res.json({ message: 'Student enrolled in category successfully' });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error enrolling student' });
    }
};

// --- Password Reset ---

import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService';

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = z.object({ email: z.string().email() }).parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // For security, do not reveal if user exists. Just say email sent.
            return res.status(200).json({ message: 'If account exists, reset email sent' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save to DB
        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry }
        });

        // Send Email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailSent = await sendPasswordResetEmail(email, resetLink);

        if (!emailSent) {
            console.log(`Debug - Mock Reset Link for ${email}: ${resetLink}`);
        }

        res.status(200).json({ message: 'If account exists, reset email sent' });

    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error processing request' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = z.object({
            token: z.string(),
            password: z.string().min(6)
        }).parse(req.body);

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        // Optional: Invalidate all sessions on password change
        await prisma.session.deleteMany({ where: { userId: user.id } });

        res.status(200).json({ message: 'Password reset successfully. Please login.' });

    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error resetting password' });
    }
};

// --- Session Heartbeat Validation ---

/**
 * Lightweight session validation endpoint for heartbeat checks.
 * Returns 200 if session is valid, 401 if session has been invalidated.
 * Used by frontend to detect force-logouts within seconds.
 * 
 * @route GET /api/auth/validate-session
 */
export const validateSession = async (req: Request, res: Response) => {
    // The protect middleware already validates the session
    // If we reach here, the session is valid
    res.status(200).json({ valid: true });
};

/**
 * Logout - Invalidate current session
 * 
 * Deletes the session from the database so the token can no longer be used.
 * Should be called when user intentionally logs out.
 * 
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        // Delete the session from database
        const deleted = await prisma.session.deleteMany({
            where: { token }
        });

        if (deleted.count === 0) {
            // Session already invalidated or never existed
            return res.status(200).json({ message: 'Session already invalid' });
        }

        console.log(`[Auth] User logged out successfully`);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('[Auth] Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
};

// --- Update Student ---

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const requestingUser = (req as any).user;
        if (!['TEACHER', 'ADMIN'].includes(requestingUser.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const id = req.params.id as string;
        const schema = z.object({
            name: z.string().min(2).optional(),
            email: z.string().email().optional(),
            phoneNumber: z.string().optional(),
        });

        const data = schema.parse(req.body);

        // Check email uniqueness if email is being updated
        if (data.email) {
            const existing = await prisma.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id }
                }
            });
            if (existing) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, phoneNumber: true, enrolledCategories: true }
        });

        res.json(updatedUser);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error updating student' });
    }
};
