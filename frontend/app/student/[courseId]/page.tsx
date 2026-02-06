"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    IconArrowLeft,
    IconCheck,
    IconCircle,
    IconLoader2,
    IconPlayerPlay,
    IconMenu2,
    IconX,
    IconLock,
    IconFileText,
    IconDownload
} from "@tabler/icons-react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import VideoPlayer from "@/components/course/VideoPlayer";

interface ContentBlock {
    id: string;
    type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'DOCUMENT';
    content: any; // Using any for flexibility with JSON
    order: number;
}

interface Lesson {
    id: string;
    title: string;
    description: string;
    videoId: string;
    duration: string;
    isCompleted?: boolean;
    isFree?: boolean;
    contentBlocks?: ContentBlock[];
}

interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Course {
    id: string;
    title: string;
    chapters: Chapter[];
    lessons?: Lesson[]; // Fallback for headless lessons
}

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});



    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await api.get(`/courses/${courseId}`);
                setCourse(data);

                let firstLesson = null;
                if (data.chapters?.[0]?.lessons?.[0]) {
                    firstLesson = data.chapters[0].lessons[0];
                } else if (data.lessons?.[0]) {
                    firstLesson = data.lessons[0];
                }

                setActiveLesson(firstLesson);

                try {
                    const progressData = await api.get(`/courses/${courseId}/progress`);
                    if (progressData && typeof progressData === 'object') {
                        setProgressMap(progressData);
                    }
                } catch (e) {
                    console.warn("Could not fetch progress", e);
                }

            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleLessonSelect = (lesson: Lesson) => {
        setActiveLesson(lesson);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const handleFinishAndContinue = async () => {
        if (!activeLesson || !course) return;

        setCompleting(true);
        try {
            await api.post(`/courses/${courseId}/lessons/${activeLesson.id}/complete`, { completed: true });

            setProgressMap(prev => ({ ...prev, [activeLesson.id]: true }));

            // Find next lesson
            let nextLesson = null;
            let foundCurrent = false;

            const allLessons: Lesson[] = [];
            if (course.chapters?.length > 0) {
                course.chapters.forEach(c => allLessons.push(...c.lessons));
            } else if (course.lessons) {
                allLessons.push(...course.lessons);
            }

            for (const lesson of allLessons) {
                if (foundCurrent) {
                    nextLesson = lesson;
                    break;
                }
                if (lesson.id === activeLesson.id) {
                    foundCurrent = true;
                }
            }

            if (nextLesson) {
                setActiveLesson(nextLesson);
                // Scroll to top of content
                const mainContent = document.getElementById('main-content');
                if (mainContent) mainContent.scrollTop = 0;
            }

        } catch (error) {
            console.error("Failed to mark complete", error);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <IconLoader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Course not found.</p>
                <Button onClick={() => router.push("/student")}>Back to Dashboard</Button>
            </div>
        );
    }



    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden relative">
            {/* Header */}
            <header className="h-16 bg-primary text-primary-foreground flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30 shadow-md">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/student")}
                        className="text-primary-foreground/80 hover:text-white hover:bg-white/10"
                    >
                        <IconArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-semibold text-lg line-clamp-1">{course.title}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-primary-foreground"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <IconX className="w-5 h-5" /> : <IconMenu2 className="w-5 h-5" />}
                    </Button>
                    <Button
                        className="bg-white text-primary hover:bg-white/90 hidden sm:flex font-bold shadow-sm"
                        onClick={handleFinishAndContinue}
                        disabled={completing}
                    >
                        {completing ? <IconLoader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Finish and continue &gt;
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "w-80 bg-background border-r flex flex-col absolute md:relative z-20 h-full transition-all duration-300 ease-in-out transform shadow-xl md:shadow-none",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-none overflow-hidden"
                    )}
                >
                    <div className="p-4 border-b font-semibold flex justify-between items-center bg-muted/30">
                        <span>Course Content</span>
                        <div className="text-xs text-muted-foreground">
                            {Object.keys(progressMap).length} Completed
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scroll">
                        <div className="pb-10">
                            {course.chapters?.length > 0 ? (
                                course.chapters.map((chapter, index) => (
                                    <div key={chapter.id}>
                                        <div className="px-4 py-3 bg-muted/50 text-sm font-semibold text-muted-foreground sticky top-0 backdrop-blur-sm z-10 border-y border-border/50">
                                            Part #{index + 1} - {chapter.title}
                                        </div>
                                        <div>
                                            {chapter.lessons?.map((lesson) => {
                                                const isCompleted = progressMap[lesson.id];
                                                const isActive = activeLesson?.id === lesson.id;
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleLessonSelect(lesson)}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 text-sm flex gap-3 items-start transition-colors border-l-4 border-transparent hover:bg-muted/50",
                                                            isActive
                                                                ? "bg-primary/5 border-l-primary text-primary font-medium"
                                                                : "text-muted-foreground"
                                                        )}
                                                    >
                                                        <div className="mt-0.5 flex-shrink-0">
                                                            {isCompleted ? (
                                                                <IconCheck className="w-4 h-4 text-emerald-500" />
                                                            ) : isActive ? (
                                                                <IconPlayerPlay className="w-4 h-4 fill-current" />
                                                            ) : (
                                                                <IconCircle className="w-4 h-4 opacity-50" />
                                                            )}
                                                        </div>
                                                        <span className="line-clamp-2">{lesson.title}</span>
                                                        <span className="ml-auto text-xs opacity-70 whitespace-nowrap">{lesson.duration || "5:00"}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2">
                                    {course.lessons?.map((lesson) => {
                                        const isCompleted = progressMap[lesson.id];
                                        const isActive = activeLesson?.id === lesson.id;
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => handleLessonSelect(lesson)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 text-sm flex gap-3 items-start transition-colors border-l-4 border-transparent hover:bg-muted/50 border-b",
                                                    isActive
                                                        ? "bg-primary/5 border-l-primary text-primary font-medium"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                <div className="mt-0.5 flex-shrink-0">
                                                    {isCompleted ? (
                                                        <IconCheck className="w-4 h-4 text-emerald-500" />
                                                    ) : isActive ? (
                                                        <IconPlayerPlay className="w-4 h-4 fill-current" />
                                                    ) : (
                                                        <IconCircle className="w-4 h-4 opacity-50" />
                                                    )}
                                                </div>
                                                <span className="line-clamp-2">{lesson.title}</span>
                                            </button>
                                        );
                                    })}
                                    {!course.lessons?.length && <p className="text-center text-sm text-muted-foreground py-4">No content available.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main id="main-content" className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8 w-full scroll-smooth">
                    {activeLesson ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Title */}
                            <div className="flex items-start gap-4">
                                <h2 className="text-2xl font-bold text-foreground">
                                    {activeLesson.title}
                                </h2>
                            </div>



                            {/* Content Rendering: Linear Order */}
                            <div className="space-y-8">
                                {activeLesson.contentBlocks && activeLesson.contentBlocks.length > 0 ? (
                                    activeLesson.contentBlocks.map(block => {
                                        if (block.type === 'TEXT') {
                                            return (
                                                <div key={block.id} className="prose prose-slate dark:prose-invert max-w-none bg-background p-6 rounded-xl border shadow-sm">
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: typeof block.content === 'string'
                                                            ? block.content
                                                            : block.content?.html || ""
                                                    }} />
                                                </div>
                                            );
                                        }

                                        if (block.type === 'VIDEO') {
                                            return (
                                                <div key={block.id} className="w-full bg-black rounded-xl overflow-hidden shadow-lg relative z-0">
                                                    <VideoPlayer
                                                        videoId={block.content?.videoId}
                                                        courseId={courseId}
                                                        lessonId={activeLesson.id}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (block.type === 'DOCUMENT') {
                                            const fileUrl = block.content?.fileUrl;
                                            const isImage = block.content?.mimetype?.startsWith('image/');
                                            const fileName = block.content?.fileName || "Document";
                                            const fullUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}${fileUrl}`;

                                            if (!fileUrl) return null;

                                            return (
                                                <div key={block.id} className="w-full">
                                                    {isImage ? (
                                                        <div className="rounded-xl overflow-hidden border shadow-sm bg-background">
                                                            <img
                                                                src={fullUrl}
                                                                alt={fileName}
                                                                className="w-full h-auto max-h-[600px] object-contain mx-auto"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between p-4 bg-background border rounded-xl shadow-sm hover:border-primary/50 transition-colors group">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                                                    <IconFileText className="w-6 h-6" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-foreground">{fileName}</p>
                                                                    <p className="text-xs text-muted-foreground uppercase">PDF DOCUMENT</p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => window.open(fullUrl, '_blank')}
                                                                className="gap-2"
                                                            >
                                                                <IconDownload className="w-4 h-4" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (block.type === 'QUIZ') {
                                            return (
                                                <div key={block.id} className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl flex flex-col items-center text-center gap-4 shadow-sm">
                                                    <div className="bg-primary p-4 rounded-full text-white shadow-lg">
                                                        <HelpCircle className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-foreground">Lesson Quiz Available</h3>
                                                        <p className="text-muted-foreground mt-1 max-w-md">Test your knowledge on this lesson with a quick quiz.</p>
                                                    </div>
                                                    <Button
                                                        size="lg"
                                                        className="font-bold px-8 shadow-md"
                                                        onClick={() => {
                                                            // For now simple alert, or we could navigate
                                                            alert("Quiz player coming soon in Beta!");
                                                        }}
                                                    >
                                                        Take the Quiz
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        // Fallback for other types
                                        return (
                                            <div key={block.id} className="p-4 border rounded bg-muted text-muted-foreground">
                                                Unsupported block type: {block.type}
                                            </div>
                                        );
                                    })
                                ) : (
                                    /* Legacy Fallback: Main Video + Description */
                                    <>
                                        {activeLesson.videoId && (
                                            <div className="w-full bg-black rounded-xl overflow-hidden shadow-lg relative z-0">
                                                <VideoPlayer
                                                    videoId={activeLesson.videoId}
                                                    courseId={courseId}
                                                    lessonId={activeLesson.id}
                                                />
                                            </div>
                                        )}

                                        <div className="prose prose-slate dark:prose-invert max-w-none bg-background p-6 rounded-xl border shadow-sm">
                                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                                <span className="w-1 h-6 bg-primary rounded-full"></span>
                                                About this lesson
                                            </h3>
                                            {activeLesson.description ? (
                                                <div dangerouslySetInnerHTML={{ __html: activeLesson.description }} />
                                            ) : (
                                                <p className="text-muted-foreground italic">No description provided.</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Navigation Footer */}
                            <div className="flex justify-between items-center py-8">
                                <div className="text-sm text-muted-foreground">
                                    {/* Prev button logic if needed */}
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleFinishAndContinue}
                                    disabled={completing}
                                    className="gap-2 shadow-md"
                                >
                                    Finish & Continue
                                    <IconArrowLeft className="w-4 h-4 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <IconPlayerPlay className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Select a lesson to start watching</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
