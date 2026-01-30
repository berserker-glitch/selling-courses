import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

        // Check if session exists and is valid
        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!session) {
            return res.status(401).json({ message: 'Session expired or invalid' });
        }

        if (new Date() > session.expiresAt) {
            await prisma.session.delete({ where: { id: session.id } });
            return res.status(401).json({ message: 'Session expired' });
        }

        // Update last active
        await prisma.session.update({
            where: { id: session.id },
            data: { lastActive: new Date() }
        });

        req.user = session.user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized' });
    }
};

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({
                message: `Role ${user?.role} is not authorized to access this route`
            });
        }
        next();
    };
};
