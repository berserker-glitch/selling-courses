import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const logAudit = async (
    userId: string | undefined,
    action: string,
    metadata: any = null,
    req: any = null
) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                metadata: metadata ?? Prisma.DbNull,
                ip: req?.ip || null,
                userAgent: req?.headers ? req.headers['user-agent'] : null
            }
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};
