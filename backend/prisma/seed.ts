import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = [
        { name: 'Development', description: 'Coding and programming' },
        { name: 'Business', description: 'Business and entrepreneurship' },
        { name: 'Finance', description: 'Finance and accounting' },
        { name: 'IT & Software', description: 'IT and software' },
        { name: 'Office Productivity', description: 'Office productivity' },
        { name: 'Personal Development', description: 'Personal development' },
        { name: 'Design', description: 'Design' },
        { name: 'Marketing', description: 'Marketing' },
        { name: 'Lifestyle', description: 'Lifestyle' },
        { name: 'Photography & Video', description: 'Photography and video' },
        { name: 'Health & Fitness', description: 'Health and fitness' },
        { name: 'Music', description: 'Music' },
        { name: 'Teaching & Academics', description: 'Teaching and academics' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }

    console.log('Categories seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
