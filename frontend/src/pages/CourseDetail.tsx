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
                // Should ideally check for last played, but defaulting to first
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
            setComments([]);
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

    // Theme Color Handling
    // Default to Emerald Green if not set, or use the course's custom theme
    const themeColor = course.themeColor || '#10b981';

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
        api.put(`/lessons/${activeLesson.id}/progress`, { lastPosition: Math.floor(time) }).catch(() => { });
    };

    const onProgressUpdate = (time: number) => {
        if (Math.floor(time) % 5 === 0) {
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
        <div
            className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50"
            // Inject theme color as CSS variable for dynamic styling
            style={{ '--theme-color': themeColor } as React.CSSProperties}
        >

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Enhanced Design */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:relative lg:translate-x-0 flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ backgroundColor: themeColor }}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/10">
                    <button
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium mb-4"
                        onClick={() => navigate('/student')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </button>

                    <h2 className="text-xl font-bold tracking-tight mb-2 text-white line-clamp-2">
                        {course.title}
                    </h2>

                    {/* Progress Bar (White on colored bg) */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-white/90">
                            <span>Progress</span>
                            <span>{course.progress || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-white transition-all duration-500"
                                style={{
                                    width: `${course.progress || 0}%`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Lesson List */}
                <ScrollArea className="flex-1 scrollbar-thin">
                    <div className="py-2 px-3 space-y-1">
                        {course.lessons.map((lesson, index) => {
                            const isActive = activeLesson.id === lesson.id;
                            const isCompleted = lesson.completed;

                            return (
                                <div
                                    key={lesson.id}
                                    onClick={() => {
                                        setActiveLesson(lesson);
                                        if (matchIsMobile()) setIsSidebarOpen(false);
                                    }}
                                    className={cn(
                                        "group flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                                        isActive
                                            ? "bg-white shadow-sm"
                                            : "hover:bg-white/10 border-transparent"
                                    )}
                                >
                                    {/* Icon Indicator */}
                                    <div
                                        className={cn(
                                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 transition-colors",
                                            isActive ? "text-white" :
                                                isCompleted ? "bg-white/20 text-white" : "bg-black/10 text-white/70"
                                        )}
                                        style={isActive ? { backgroundColor: themeColor } : {}}
                                    >
                                        {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> :
                                            isActive ? <PlayCircle className="h-3.5 w-3.5" /> :
                                                <span className="text-[10px] font-bold">{index + 1}</span>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                            "text-sm font-semibold leading-snug mb-0.5",
                                            isActive ? "text-slate-900" : "text-white"
                                        )}>
                                            {lesson.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Clock className={cn("h-3 w-3", isActive ? "text-slate-400" : "text-white/60")} />
                                            <span className={cn("text-[11px] font-medium", isActive ? "text-slate-400" : "text-white/60")}>{lesson.duration || '5:00'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10 bg-black/5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                            {(user?.name || '?')[0]}
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-white">Logged in as</p>
                            <p className="text-white/70 truncate max-w-[150px]">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
                    <span className="font-semibold truncate max-w-[200px] text-sm">{course.title}</span>
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                <div className="mx-auto max-w-5xl p-6 lg:p-10 space-y-10">

                    {/* Lesson Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: themeColor }}>
                            <Sparkles className="h-4 w-4" />
                            <span>Current Lesson</span>
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                            {activeLesson.title}
                        </h1>
                    </div>

                    {/* Video Player Container */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl bg-black ring-1 ring-slate-900/5 dark:ring-white/10"
                        style={{ boxShadow: `0 20px 40px -10px ${themeColor}20` }} // Dynamic colored shadow
                    >
                        <div className="aspect-video w-full">
                            {activeLesson.videoId ? (
                                <VDCipherPlayer
                                    videoId={activeLesson.videoId}
                                    onComplete={handleComplete}
                                    userEmail={user?.email}
                                    lastPosition={(activeLesson as any).lastPosition}
                                    onProgress={onProgressUpdate}
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center text-slate-500 bg-slate-900/50">
                                    <PlayCircle className="h-16 w-16 mb-4 opacity-50" />
                                    <p className="font-medium">No video content</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lesson Description - Rendered HTML */}
                    {activeLesson.description && (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: activeLesson.description }} />
                        </div>
                    )}

                    {/* Controls & Navigation */}
                    <div className="flex items-center justify-between py-6 border-b border-slate-200 dark:border-slate-800">
                        <Button
                            variant="outline"
                            onClick={goToPrevious}
                            disabled={!hasPrevious}
                            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>

                        <Button
                            onClick={goToNext}
                            disabled={!hasNext}
                            className="text-white shadow-lg shadow-current/20 hover:shadow-current/40 transition-all font-semibold px-8"
                            style={{ backgroundColor: themeColor }}
                        >
                            Next Lesson <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>

                    {/* Discussion Section */}
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                                <MessageCircle className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discussion</h2>
                                <p className="text-sm text-slate-500">Join the conversation with {comments.length} comments</p>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="flex gap-4 mb-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-600">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="relative">
                                    <textarea
                                        placeholder="Ask a question or share your thoughts..."
                                        className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all shadow-sm"
                                        style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        className="text-white font-medium"
                                        style={{ backgroundColor: themeColor }}
                                        onClick={postComment}
                                        disabled={isPostingComment || !newComment.trim()}
                                    >
                                        {isPostingComment ? 'Posting...' : 'Post Comment'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-8">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <div
                                            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase shadow-sm shrink-0"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            {comment.user.name?.substring(0, 2)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                                        {comment.user.name}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No comments yet</p>
                                    <p className="text-sm text-slate-400">Be the first to start the discussion!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
