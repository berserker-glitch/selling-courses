import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft,
    PlayCircle,
    CheckCircle,
    Lock,
    Menu,
    X,
    ChevronRight,
    ChevronDown,
    Sparkles,
    MessageCircle,
    Clock,
    ArrowRight,
    User
} from 'lucide-react';
import { Course, Lesson } from '@/types';
import { VDCipherPlayer } from '@/components/VDCipherPlayer';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

/**
 * Part/Section interface for grouping lessons
 * Used to organize lessons into collapsible sections
 */
interface Part {
    id: string;
    title: string;
    lessons: Lesson[];
}

/**
 * CourseDetail Component
 * Main course viewing page for students with:
 * - Collapsible sidebar with lesson sections
 * - Video player with clean design
 * - Lesson content and description
 * - Discussion section placeholder
 */
export default function CourseDetail() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set(['part-0']));
    const [user, setUser] = useState<any>(null);

    /**
     * Checks if viewport is mobile size
     */
    const matchIsMobile = () => window.innerWidth <= 1024;

    /**
     * Toggles expansion state of a part/section
     */
    const togglePart = (partId: string) => {
        setExpandedParts(prev => {
            const next = new Set(prev);
            if (next.has(partId)) {
                next.delete(partId);
            } else {
                next.add(partId);
            }
            return next;
        });
    };

    /**
     * Effect: Load user data and fetch course on mount
     */
    useEffect(() => {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
        }

        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${courseId}`);
                setCourse(data);

                // Default to first lesson
                if (data.lessons && data.lessons.length > 0) {
                    setActiveLesson(data.lessons[0]);
                }
            } catch (error) {
                console.error('Failed to fetch course', error);
                navigate('/student');
            }
        };

        if (courseId) fetchCourse();
    }, [courseId, navigate]);

    if (!course || !activeLesson) return null;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    /**
     * Groups lessons into parts/sections for sidebar display
     * Currently creates a single "All Lessons" section - can be extended
     * to support actual course parts from API
     */
    const parts: Part[] = [
        {
            id: 'part-0',
            title: 'Course Content',
            lessons: course.lessons
        }
    ];

    /**
     * Calculates completion stats for a part
     */
    const getPartStats = (part: Part) => {
        const completed = part.lessons.filter(l => l.completed).length;
        return { completed, total: part.lessons.length };
    };

    /**
     * Gets current lesson index and navigation helpers
     */
    const currentLessonIndex = course.lessons.findIndex(l => l.id === activeLesson.id);
    const hasPrevious = currentLessonIndex > 0;
    const hasNext = currentLessonIndex < course.lessons.length - 1;

    const goToPrevious = () => {
        if (hasPrevious) {
            setActiveLesson(course.lessons[currentLessonIndex - 1]);
        }
    };

    const goToNext = () => {
        if (hasNext) {
            setActiveLesson(course.lessons[currentLessonIndex + 1]);
        }
    };

    /**
     * Marks current lesson as complete via API
     */
    const handleComplete = () => {
        api.put(`/lessons/${activeLesson.id}/progress`, { completed: true });
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">

            {/* Mobile Overlay when sidebar is open */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Lesson List */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:relative lg:translate-x-0 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Sidebar Header - Navigation & Action */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <button
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
                        onClick={() => navigate('/student')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous lesson</span>
                    </button>
                    <Button
                        size="sm"
                        className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs gap-1"
                        onClick={goToNext}
                        disabled={!hasNext}
                    >
                        Finish and continue
                        <ArrowRight className="h-3 w-3" />
                    </Button>
                </div>

                {/* Course Title & Progress */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
                    <h2 className="text-lg font-bold tracking-tight mb-1">{course.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {course.lessons.filter(l => l.completed).length} / {course.lessons.length} lessons completed
                    </p>
                    <Progress value={course.progress || 0} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Lessons List with Collapsible Sections */}
                <ScrollArea className="flex-1 scrollbar-thin">
                    <div className="py-2">
                        {parts.map((part, partIndex) => {
                            const stats = getPartStats(part);
                            const isExpanded = expandedParts.has(part.id);

                            return (
                                <div key={part.id} className="mb-1">
                                    {/* Part Header */}
                                    <button
                                        onClick={() => togglePart(part.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronDown className={cn(
                                                "h-4 w-4 text-slate-400 transition-transform duration-200",
                                                !isExpanded && "-rotate-90"
                                            )} />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Part #{partIndex + 1} · {part.title}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">
                                            {stats.completed}/{stats.total}
                                        </span>
                                    </button>

                                    {/* Lessons in Part */}
                                    {isExpanded && (
                                        <div className="animate-fade-in">
                                            {part.lessons.map((lesson, lessonIndex) => {
                                                const isActive = activeLesson.id === lesson.id;
                                                const isCompleted = lesson.completed;
                                                const globalIndex = course.lessons.findIndex(l => l.id === lesson.id);
                                                const isLocked = globalIndex > 0 && !course.lessons[globalIndex - 1].completed && !isCompleted;

                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        onClick={() => {
                                                            if (!isLocked) {
                                                                setActiveLesson(lesson);
                                                                if (matchIsMobile()) setIsSidebarOpen(false);
                                                            }
                                                        }}
                                                        className={cn(
                                                            "group flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-all duration-200",
                                                            isActive
                                                                ? "bg-sky-50 border-l-2 border-sky-500 dark:bg-sky-900/10"
                                                                : "hover:bg-slate-50 dark:hover:bg-slate-900/30 border-l-2 border-transparent",
                                                            isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                                        )}
                                                    >
                                                        {/* Lesson Status Icon */}
                                                        <div className={cn(
                                                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                                                            isActive ? "bg-sky-500 text-white" :
                                                                isCompleted ? "bg-teal-500 text-white" :
                                                                    "bg-transparent border border-slate-300 dark:border-slate-600"
                                                        )}>
                                                            {isLocked ? (
                                                                <Lock className="h-2.5 w-2.5" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle className="h-3 w-3" />
                                                            ) : isActive ? (
                                                                <PlayCircle className="h-3 w-3" />
                                                            ) : (
                                                                <span className="text-[10px] font-medium text-slate-500">{lessonIndex + 1}</span>
                                                            )}
                                                        </div>

                                                        {/* Lesson Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={cn(
                                                                "text-sm font-medium truncate",
                                                                isActive ? "text-sky-700 dark:text-sky-300" : "text-slate-700 dark:text-slate-300"
                                                            )}>
                                                                {lesson.title}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Clock className="h-3 w-3 text-slate-400" />
                                                                <span className="text-[11px] text-slate-400">{lesson.duration || '5:00'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/student')} className="-ml-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <span className="font-semibold truncate max-w-[200px]">{course.title}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="mx-auto max-w-4xl p-6 lg:p-10 space-y-8">

                    {/* Course Header - Breadcrumb Style */}
                    <div className="hidden lg:block">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                            <span>{course.title}</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>Part #1</span>
                        </div>
                    </div>

                    {/* Lesson Title */}
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            [{course.title?.substring(0, 3).toUpperCase()}#{currentLessonIndex + 1}] {activeLesson.title}
                        </h1>
                    </div>

                    {/* Video Player Container */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-course bg-slate-900">
                        {activeLesson.videoId ? (
                            <VDCipherPlayer
                                videoId={activeLesson.videoId}
                                onComplete={handleComplete}
                                userEmail={user?.email}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">
                                <div className="text-center">
                                    <PlayCircle className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                                    <p>No video available for this lesson</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Author/Academy Info */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {course.title} Academy
                        </span>
                    </div>

                    {/* Lesson Description */}
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            {activeLesson.description || "Welcome to this lesson! In this module, we will explore the core concepts and apply them to real-world scenarios. Pay attention to the details as they form the foundation for the next sections."}
                        </p>
                    </div>

                    {/* Tip Callout */}
                    <div className="callout-tip">
                        <div className="flex items-start gap-3">
                            <span className="text-lg">💡</span>
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Pro tip:</strong> Take notes while watching. If you have questions, join our community discussion below to connect with other learners!
                            </p>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            onClick={goToPrevious}
                            disabled={!hasPrevious}
                            className="text-slate-600 dark:text-slate-400"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous lesson
                        </Button>
                        <Button
                            onClick={goToNext}
                            disabled={!hasNext}
                            className="bg-sky-600 hover:bg-sky-700 text-white"
                        >
                            Finish and continue
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                    {/* Discussion Section */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-6">
                            <MessageCircle className="h-5 w-5 text-slate-500" />
                            <h2 className="text-lg font-semibold">Discussion</h2>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                                0 comments
                            </span>
                        </div>

                        {/* Comment Input */}
                        <div className="flex items-start gap-3 mb-6">
                            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="Share your thoughts or ask a question..."
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                    rows={3}
                                />
                                <div className="flex justify-end mt-2">
                                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">
                                        Publish
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Empty State */}
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <MessageCircle className="h-10 w-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
