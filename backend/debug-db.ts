
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to DB...');
        // Find a course with lessons
        const course = await prisma.course.findFirst({
            include: {
                chapters: {
                    include: {
                        lessons: {
                            include: { contentBlocks: true }
                        }
                    }
                },
                lessons: {
                    include: { contentBlocks: true }
                }
            }
        });

        if (!course) {
            console.log('No courses found.');
            return;
        }

        console.log(`Found course: ${course.id} - ${course.title}`);

        let blocksFound = 0;

        // Check chapters
        if (course.chapters.length > 0) {
            console.log(`Course has ${course.chapters.length} chapters.`);
            course.chapters.forEach(ch => {
                if (ch.lessons.length > 0) {
                    ch.lessons.forEach(l => {
                        if (l.contentBlocks && l.contentBlocks.length > 0) {
                            console.log(`  Lesson (in chapter) ${l.id} has ${l.contentBlocks.length} blocks.`);
                            console.log('  Sample:', JSON.stringify(l.contentBlocks[0].content));
                            blocksFound++;
                        } else {
                            console.log(`  Lesson (in chapter) ${l.id} has NO blocks.`);
                        }
                    });
                }
            });
        }

        // Check direct lessons
        if (course.lessons.length > 0) {
            console.log(`Course has ${course.lessons.length} direct lessons.`);
            course.lessons.forEach(l => {
                if (l.contentBlocks && l.contentBlocks.length > 0) {
                    console.log(`  Direct Lesson ${l.id} has ${l.contentBlocks.length} blocks.`);
                    console.log('  Sample:', JSON.stringify(l.contentBlocks[0].content));
                    blocksFound++;
                } else {
                    console.log(`  Direct Lesson ${l.id} has NO blocks.`);
                }
            });
        }

        if (blocksFound === 0) {
            console.log('Use screenshot IDs to check specifically?');
            // Let's try to find a lesson by ID from the screenshot if possible, but screenshot ID was partial.
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
