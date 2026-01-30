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
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
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
