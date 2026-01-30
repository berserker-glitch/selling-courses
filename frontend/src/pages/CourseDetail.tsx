import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    PlayCircle,
    CheckCircle,
    Lock,
    Menu,
    X,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { mockCourses, studentCourseProgress, studentLessonProgress, Course, Lesson } from '@/lib/mock-data';
import { VideoPlayer } from '@/components/VideoPlayer';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function CourseDetail() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

    const [user, setUser] = useState<any>(null);

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

                // Fetch progress
                try {
                    const progressRes = await api.get(`/courses/${courseId}/progress`);
                    // Assuming backend returns progress map or similar. 
                    // For now just basic course data is enough to start.
                } catch (e) { console.error("Progress fetch failed", e); }

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

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 selection:bg-sky-500/30">

            {/* Aurora Background (Subtle) */}
            <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-sky-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden absolute top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
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

            {/* Sidebar - Lesson List */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white/60 backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/60 lg:relative lg:translate-x-0 pt-16 lg:pt-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200/50 dark:border-slate-800/50">
                        <div
                            className="flex items-center gap-2 text-sky-600 dark:text-sky-400 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate('/student')}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                            <span className="font-bold tracking-tight">Back</span>
                        </div>
                    </div>

                    {/* Course Info Summary */}
                    <div className="p-6 pb-2">
                        <h2 className="text-lg font-bold leading-tight tracking-tight mb-2">{course.title}</h2>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            <span>Course Progress</span>
                            <span>{studentCourseProgress[course.id] || 0}%</span>
                        </div>
                        <Progress value={studentCourseProgress[course.id] || 0} className="h-1.5 bg-slate-200 dark:bg-slate-800" indicatorClassName="bg-sky-500" />
                    </div>

                    <Separator className="my-4 bg-slate-200/50 dark:bg-slate-800/50 opacity-50" />

                    {/* Lessons List */}
                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-2 pb-6">
                            {course.lessons.map((lesson, index) => {
                                const isActive = activeLesson.id === lesson.id;
                                const isCompleted = studentLessonProgress[lesson.id];
                                const isLocked = index > 0 && !studentLessonProgress[course.lessons[index - 1].id] && !isCompleted;

                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => !isLocked && setActiveLesson(lesson)}
                                        className={cn(
                                            "group flex cursor-pointer flex-col gap-1 rounded-xl p-3 transition-all duration-200 border border-transparent",
                                            isActive
                                                ? "bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-900/30"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                                            isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                                                isActive ? "border-sky-500 text-sky-500 bg-sky-100 dark:bg-sky-900/40" :
                                                    isCompleted ? "border-teal-500 text-teal-500 bg-teal-50 dark:bg-teal-900/20" :
                                                        "border-slate-300 text-slate-400 dark:border-slate-700 bg-transparent"
                                            )}>
                                                {isLocked ? (
                                                    <Lock className="h-3 w-3" />
                                                ) : isCompleted ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className={cn(
                                                    "truncate text-sm font-medium",
                                                    isActive ? "text-sky-700 dark:text-sky-300" : "text-slate-700 dark:text-slate-300"
                                                )}>
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-[10px] text-slate-500">{lesson.duration}</p>
                                            </div>
                                            {isActive && <ChevronRight className="h-4 w-4 text-sky-500 animate-pulse" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full relative pt-16 lg:pt-0">
                <div className="mx-auto max-w-5xl p-6 lg:p-10 space-y-8">

                    {/* Video Player Wrapper */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-2xl dark:border-slate-800 group">
                        <div className="absolute inset-0 bg-slate-900">
                            {activeLesson.videoUrl ? (
                                <VideoPlayer
                                    lesson={activeLesson}
                                    userEmail={user?.email}
                                    userId={user?.id}
                                    // onNext/onPrevious implementation requires course index logic
                                    hasPrevious={course.lessons.findIndex(l => l.id === activeLesson.id) > 0}
                                    hasNext={course.lessons.findIndex(l => l.id === activeLesson.id) < course.lessons.length - 1}
                                    onPrevious={() => {
                                        const idx = course.lessons.findIndex(l => l.id === activeLesson.id);
                                        if (idx > 0) setActiveLesson(course.lessons[idx - 1]);
                                    }}
                                    onNext={() => {
                                        const idx = course.lessons.findIndex(l => l.id === activeLesson.id);
                                        if (idx < course.lessons.length - 1) setActiveLesson(course.lessons[idx + 1]);
                                    }}
                                    onComplete={() => {
                                        // Call API to complete
                                        api.put(`/lessons/${activeLesson.id}/progress`, { completed: true });
                                    }}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-500">
                                    No video available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lesson Content */}
                    <div className="max-w-3xl space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400">
                                <Sparkles className="h-4 w-4" />
                                <span>Lesson {course.lessons.findIndex(l => l.id === activeLesson.id) + 1}</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                                {activeLesson.title}
                            </h1>
                        </div>

                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                {activeLesson.description || "In this lesson, we will explore the core concepts and apply them to real-world scenarios. Pay attention to the details as they form the foundation for the next module."}
                            </p>
                            {/* Placeholder content */}
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/20 rounded-xl px-8">
                                Complete Lesson
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-xl">
                                Mark for Review
                            </Button>
                        </div>
                    </div>

                </div>
            </main>

        </div>
    );
}
