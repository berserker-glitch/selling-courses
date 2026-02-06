import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'adminpassword123';
    const name = 'System Admin';

    console.log(`Creating admin account...`);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
            },
            create: {
                email,
                name,
                password: hashedPassword,
                role: 'ADMIN',
                maxDevices: 5
            },
        });

        console.log(`\nSUCCESS!`);
        console.log(`Admin created / updated: `);
        console.log(`Email: ${user.email} `);
        console.log(`Password: ${password} `);
        console.log(`Role: ${user.role} `);
    } catch (error) {
        console.error('Error creating admin:', error);
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
