import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// Schemas
const createCourseSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    thumbnail: z.string().optional(),
    categoryId: z.string().uuid("Invalid Category ID") // Expect ID now
});

// --- Course Handlers ---

export const getCourses = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        let where: any = {};

        if (user.role === 'STUDENT') {
            // Fetch fresh user data with enrolled categories
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: { enrolledCategories: true }
            });

            if (!dbUser || !dbUser.enrolledCategories.length) {
                // If no categories enrolled, return empty
                return res.json([]);
            }

            const categoryIds = dbUser.enrolledCategories.map(c => c.id);
            where = {
                categoryId: { in: categoryIds }
            };
        }

        const courses = await prisma.course.findMany({
            where,
            include: {
                teacher: { select: { name: true, email: true } },
                category: true,
                lessons: true,
                _count: { select: { lessons: true, enrollments: true } }
            }
        });

        res.json(courses);
    } catch (error) {
        console.error('Get Courses Error:', error); // Better logging
        res.status(500).json({ message: 'Error fetching courses' });
    }
};

export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const user = (req as any).user;

        // Fetch course with lessons and new structure
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                chapters: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            include: {
                                contentBlocks: { orderBy: { order: 'asc' } } // Optional: include basics
                            }
                        }
                    }
                },
                // Keep direct lessons for backward compatibility or mixed mode
                lessons: {
                    where: { chapterId: null }, // Only get lessons not in chapters
                    orderBy: { order: 'asc' }
                },
                teacher: { select: { name: true } },
                category: true,
                _count: { select: { enrollments: true } }
            }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If user is authenticated, fetch their progress for each lesson
        if (user?.id) {
            // Collect all lesson IDs from chapters and direct lessons
            const chapterLessonIds = course.chapters.flatMap(c => c.lessons.map(l => l.id));
            const directLessonIds = course.lessons.map(l => l.id);
            const allLessonIds = [...chapterLessonIds, ...directLessonIds];

            const lessonProgress = await prisma.lessonProgress.findMany({
                where: {
                    userId: user.id,
                    lessonId: { in: allLessonIds }
                }
            });

            // Create a map of lessonId -> progress stats
            const progressMap = new Map(
                lessonProgress.map(lp => [lp.lessonId, { completed: lp.completed, lastPosition: lp.lastPosition }])
            );

            // Hydrate chapters with progress
            const chaptersWithProgress = course.chapters.map(chapter => ({
                ...chapter,
                lessons: chapter.lessons.map(lesson => {
                    const prog = progressMap.get(lesson.id);
                    return {
                        ...lesson,
                        completed: prog?.completed || false,
                        lastPosition: prog?.lastPosition || 0
                    };
                })
            }));

            // Hydrate direct lessons
            const lessonsWithProgress = course.lessons.map(lesson => {
                const prog = progressMap.get(lesson.id);
                return {
                    ...lesson,
                    completed: prog?.completed || false,
                    lastPosition: prog?.lastPosition || 0
                };
            });

            // Get enrollment for overall progress
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: { userId: user.id, courseId: id }
                }
            });

            return res.json({
                ...course,
                chapters: chaptersWithProgress,
                lessons: lessonsWithProgress, // Direct lessons only
                progress: enrollment?.progress || 0
            });
        }

        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
};

export const createCourse = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only teachers can create courses' });
        }

        const data = createCourseSchema.parse(req.body);

        // Fetch category name for fallback if needed, or just link
        // const category = await prisma.category.findUnique({ where: { id: data.categoryId } });

        const course = await prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                thumbnail: data.thumbnail,
                categoryId: data.categoryId,
                teacherId: user.id
            },
            include: {
                category: true, // Return with category loaded
                lessons: true
            }
        });

        res.status(201).json(course);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            // Explicitly cast to any to handle Zod version type mismatches
            const zodError = error as any;
            const issues = zodError.errors || zodError.issues || [];
            console.log('Validation Error:', issues);
            return res.status(400).json({
                message: issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
            });
        }
        console.error('Create Course Error:', error);
        res.status(400).json({ message: error.message || 'Error creating course' });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const user = (req as any).user;

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course' });
    }
};

export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const user = (req as any).user;

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = createCourseSchema.partial().parse(req.body);

        const updated = await prisma.course.update({
            where: { id },
            data
        });

        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error updating course' });
    }
};

// --- Lesson Handlers ---

export const addLesson = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params as { courseId: string };
        const user = (req as any).user;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = lessonSchema.parse(req.body);

        // Get current lesson count for order (scoped to chapter if provided?)
        const count = await prisma.lesson.count({
            where: {
                courseId,
                chapterId: data.chapterId || null
            }
        });

        const lesson = await prisma.lesson.create({
            data: {
                title: data.title,
                description: data.description,
                videoId: data.videoId,
                duration: data.duration || "0",
                courseId,
                chapterId: data.chapterId,
                order: count + 1
            }
        });

        res.status(201).json(lesson);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error adding lesson' });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    try {
        const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
        const user = (req as any).user;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = lessonSchema.partial().parse(req.body);

        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data
        });

        res.json(lesson);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error updating lesson' });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const { courseId, lessonId } = req.params as { courseId: string; lessonId: string };
        const user = (req as any).user;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.teacherId !== user.id && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.lesson.delete({ where: { id: lessonId } });
        res.json({ message: 'Lesson deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error deleting lesson' });
    }
};

// --- Enrollment / Progress ---

export const enrollCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params as { courseId: string };
        const user = (req as any).user; // From auth middleware

        // Check if already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Already enrolled' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId
            }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course' });
    }
}
