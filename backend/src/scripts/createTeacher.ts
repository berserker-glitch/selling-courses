import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'teacher@example.com';
    const password = 'password123';
    const name = 'Admin Teacher';

    console.log(`Creating teacher account...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'TEACHER', // Ensure role is updated if user exists
            },
            create: {
                email,
                name,
                password: hashedPassword,
                role: 'TEACHER',
            },
        });

        console.log(`\nSUCCESS!`);
        console.log(`Teacher created/updated:`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${user.role}`);
    } catch (error) {
        console.error('Error creating teacher:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
