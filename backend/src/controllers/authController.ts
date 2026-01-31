import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

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
                ip: req.ip,
                userAgent: req.headers['user-agent']
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

        // Single Session Enforcement: Invalidating old sessions?
        // User requested "1 session per device" -> "no student can have two devices on one acc"
        // This implies STRICT single session per user account, regardless of device.
        // So we delete ALL existing sessions for this user.
        if (user.role === 'STUDENT') {
            await prisma.session.deleteMany({ where: { userId: user.id } });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                token,
                deviceId: req.headers['user-agent'] || 'unknown',
                expiresAt
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN',
                ip: req.ip,
                userAgent: req.headers['user-agent']
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

        const { name, email } = z.object({
            name: z.string().min(2),
            email: z.string().email()
        }).parse(req.body);

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate Random Password
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        console.log(`Debug - Generated Password for ${email}: ${password}`);

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const student = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'STUDENT'
            }
        });

        // Send Email
        const emailSent = await sendStudentCredentials(email, name, password);

        if (!emailSent) {
            // Optional: Rollback user creation or just warn?
            // For now, warn but return success with message
            return res.status(201).json({
                message: 'Student created but email failed to send. Please send credentials manually.',
                student: { id: student.id, email: student.email, password }
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
                role: true,
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

