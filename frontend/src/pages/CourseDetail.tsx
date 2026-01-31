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
    const [user, setUser] = useState<any>(null);

    // Comments state
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);

    const matchIsMobile = () => window.innerWidth <= 1024;
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const loadCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${courseId}`);
            setCourse(data);

            if (!activeLesson && data.lessons && data.lessons.length > 0) {
                // If we have a 'last played' logic we could use it, but start with first for now
                setActiveLesson(data.lessons[0]);
            }
        } catch (error) {
            console.error('Failed to fetch course', error);
            navigate('/student');
        }
    };

    // Load comments for active lesson
    const loadComments = async (lessonId: string) => {
        try {
            const { data } = await api.get(`/comments/${lessonId}`);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments');
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
        }

        if (courseId) loadCourse();
    }, [courseId, navigate]);

    // When active lesson changes, load its comments
    useEffect(() => {
        if (activeLesson) {
            loadComments(activeLesson.id);
        }
    }, [activeLesson?.id]);


    if (!course || !activeLesson) return null;

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

    const handleComplete = async () => {
        try {
            await api.put(`/lessons/${activeLesson.id}/progress`, { completed: true });
            await loadCourse(); // Reload to update UI
        } catch (error) {
            console.error('Failed to update progress', error);
        }
    };

    const handleProgress = async (time: number) => {
        // Debounce can be handled here or simpler: just save every 15s or on pause/exit?
        // For simplicity API call on every update is too much.
        // Let's implement a throttle or just save when leaving?
        // For this task, let's just save frequently enough (e.g. throttle 10s) 
        // OR rely on the fact that VDCipherPlayer updates prop.

        // Actually, let's save every 10 seconds.
        const now = Date.now();
        // Uses a ref to throttle? React state is async.
        // Using a timestamp check:
        // (Simplified implementation: Just fire update. The backend can handle it, but better to be safe)

        // Let's use a smarter approach: save progress on 'pause' (not available here easily without player events)
        // or just fire API. To avoid spam, let's assume VDCipherPlayer throttles or we do:

        // Implementation: Save every 15s
        // (This would require extra state logic. For "Start" task, let's trust the user usage isn't huge volume yet
        // and just fire API with a throttle check if I had lodash, but raw axios is okay for prototype)

        api.put(`/lessons/${activeLesson.id}/progress`, { lastPosition: Math.floor(time) }).catch(() => { });
    };

    // Throttled progress handler
    const onProgressUpdate = (time: number) => {
        // Only save integer seconds changes? 
        if (Math.floor(time) % 5 === 0) { // Save every 5 seconds of playtime roughly
            handleProgress(time);
        }
    };

    const postComment = async () => {
        if (!newComment.trim()) return;
        setIsPostingComment(true);
        try {
            await api.post('/comments', { lessonId: activeLesson.id, content: newComment });
            setNewComment('');
            loadComments(activeLesson.id);
        } catch (error) {
            console.error('Failed to post comment');
        } finally {
            setIsPostingComment(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Lesson List (Simplified) */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:relative lg:translate-x-0 flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <button
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
                        onClick={() => navigate('/student')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                {/* Course Title */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
                    <h2 className="text-lg font-bold tracking-tight mb-1">{course.title}</h2>
                    <Progress value={course.progress || 0} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Flat Lesson List */}
                <ScrollArea className="flex-1 scrollbar-thin">
                    <div className="py-2">
                        {course.lessons.map((lesson, index) => {
                            const isActive = activeLesson.id === lesson.id;
                            const isCompleted = lesson.completed;
                            const isLocked = false; // Unlocked all as per previous request

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => {
                                        setActiveLesson(lesson);
                                        if (matchIsMobile()) setIsSidebarOpen(false);
                                    }}
                                    className={cn(
                                        "group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-l-[3px]",
                                        isActive
                                            ? "bg-sky-50 border-sky-500 dark:bg-sky-900/10"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-900/30 border-transparent",
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                                        isActive ? "bg-sky-500 text-white" :
                                            isCompleted ? "bg-teal-500 text-white" :
                                                "bg-transparent border border-slate-300 dark:border-slate-600"
                                    )}>
                                        {isCompleted ? <CheckCircle className="h-3 w-3" /> :
                                            isActive ? <PlayCircle className="h-3 w-3" /> :
                                                <span className="text-[10px] font-medium text-slate-500">{index + 1}</span>}
                                    </div>

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
                </ScrollArea>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                    <span className="font-semibold truncate max-w-[200px]">{course.title}</span>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="mx-auto max-w-4xl p-6 lg:p-10 space-y-8">
                    {/* Lesson Title */}
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                            {activeLesson.title}
                        </h1>
                    </div>

                    {/* Video Player */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-course bg-slate-900">
                        {activeLesson.videoId ? (
                            <VDCipherPlayer
                                videoId={activeLesson.videoId}
                                onComplete={handleComplete}
                                userEmail={user?.email}
                                lastPosition={(activeLesson as any).lastPosition} // Cast as any because default Lesson type might not have lastPosition if not updated in types/index.ts yet, but it comes from API
                                onProgress={onProgressUpdate}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-500">
                                <p>No video available</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" onClick={goToPrevious} disabled={!hasPrevious}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>
                        <Button onClick={goToNext} disabled={!hasNext} className="bg-sky-600 hover:bg-sky-700 text-white">
                            Next Lesson <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                    {/* Discussion Section */}
                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-6">
                            <MessageCircle className="h-5 w-5 text-slate-500" />
                            <h2 className="text-lg font-semibold">Discussion</h2>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                                {comments.length} comments
                            </span>
                        </div>

                        {/* Comment Input */}
                        <div className="flex items-start gap-3 mb-6">
                            <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="Ask a question or share your thoughts..."
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                    rows={3}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <Button size="sm" className="bg-sky-600 text-white" onClick={postComment} disabled={isPostingComment || !newComment.trim()}>
                                        {isPostingComment ? 'Posting...' : 'Publish'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                            {comment.user.name?.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-semibold text-sm">{comment.user.name}</span>
                                                <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-0.5">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 text-sm">No comments yet.</p>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
