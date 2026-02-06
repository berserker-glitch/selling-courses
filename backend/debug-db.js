"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connecting to DB...');
            // Find a course with lessons
            const course = yield prisma.course.findFirst({
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
                            }
                            else {
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
                    }
                    else {
                        console.log(`  Direct Lesson ${l.id} has NO blocks.`);
                    }
                });
            }
            if (blocksFound === 0) {
                console.log('Use screenshot IDs to check specifically?');
                // Let's try to find a lesson by ID from the screenshot if possible, but screenshot ID was partial.
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
