import prisma from '../lib/prisma';

async function main() {
    const conversations = await prisma.conversation.findMany({
        include: {
            participants: {
                include: { user: { select: { email: true, role: true, name: true } } }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: 5
    });

    console.log('Recent Conversations and Participants:');
    console.dir(conversations, { depth: null });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
