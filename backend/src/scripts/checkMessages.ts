import prisma from '../lib/prisma';

async function main() {
    const messages = await prisma.message.findMany({
        include: {
            sender: { select: { name: true, role: true } },
            conversation: {
                include: {
                    participants: {
                        include: { user: { select: { name: true, role: true } } }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log('Recent Messages:');
    console.dir(messages, { depth: null });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
