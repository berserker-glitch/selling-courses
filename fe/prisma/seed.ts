import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { studentId: 'SUPERADMIN' },
        update: {},
        create: {
            studentId: 'SUPERADMIN',
            name: 'Super Admin',
            email: 'admin@school.com',
            password: adminPassword,
            role: 'ADMIN',
            hasAcceptedTerms: true,
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
