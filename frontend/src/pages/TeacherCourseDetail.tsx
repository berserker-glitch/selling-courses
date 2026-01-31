import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    ArrowLeft,
    PlayCircle,
    CheckCircle,
    Lock,
    Menu,
    X,
    ChevronRight,
    Sparkles,
    Plus,
    Save,
    Trash2,
    Edit
} from 'lucide-react';
import { Course, Lesson } from '@/types';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function TeacherCourseDetail() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Editing States
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedVideoId, setEditedVideoId] = useState('');
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);

    // Temp state for new lesson form
    const [newLessonTitle, setNewLessonTitle] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${courseId}`);
                setCourse(data);
                // Default to first lesson if available and no active lesson
                if (data.lessons && data.lessons.length > 0) {
                    setActiveLesson(data.lessons[0]);
                    setEditedTitle(data.lessons[0].title);
                    setEditedDescription(data.lessons[0].description || '');
                    setEditedVideoId(data.lessons[0].videoId || '');
                }
            } catch (error) {
                console.error('Failed to fetch course', error);
                navigate('/teacher');
            }
        };
        if (courseId) fetchCourse();
    }, [courseId, navigate]);

    useEffect(() => {
        if (activeLesson) {
            setEditedTitle(activeLesson.title);
            setEditedDescription(activeLesson.description || '');
            setEditedVideoId(activeLesson.videoId || '');
        }
    }, [activeLesson]);

    if (!course) return null;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleSaveChanges = async () => {
        if (!course || !activeLesson) return;

        try {
            const { data } = await api.put(`/courses/${course.id}/lessons/${activeLesson.id}`, {
                title: editedTitle,
                description: editedDescription,
                videoId: editedVideoId || undefined
            });

            const updatedLessons = course.lessons.map(l => l.id === activeLesson.id ? data : l);
            const updatedCourse = { ...course, lessons: updatedLessons };

            setCourse(updatedCourse);
            setActiveLesson(data);
            setIsEditingLesson(false);

            // Should show a toast here
        } catch (error) {
            console.error('Failed to save lesson', error);
            alert('Failed to save changes');
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Default values for new lesson
            const { data } = await api.post(`/courses/${course.id}/lessons`, {
                title: newLessonTitle,
                duration: '00:00',
                videoId: '', // Will be set after creation in edit mode
                description: ''
            });

            const updatedCourse = { ...course, lessons: [...course.lessons, data] };
            setCourse(updatedCourse);
            setActiveLesson(data);
            setNewLessonTitle('');
            setIsAddLessonOpen(false);
            setIsEditingLesson(true);
        } catch (error) {
            console.error('Failed to create lesson', error);
            alert('Failed to create lesson');
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 selection:bg-sky-500/30">

            {/* Aurora Background (Subtle) */}
            <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden absolute top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')} className="-ml-2">
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
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                            onClick={() => navigate('/teacher')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-bold tracking-tight">All Courses</span>
                        </div>
                    </div>

                    {/* Course Info Summary */}
                    <div className="p-6 pb-2">
                        <h2 className="text-lg font-bold leading-tight tracking-tight mb-2">{course.title}</h2>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            <span>{course.lessons.length} Lessons</span>
                            <span className="text-emerald-500 font-bold">Teacher View</span>
                        </div>
                        <Button
                            className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                            onClick={() => setIsAddLessonOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Lesson
                        </Button>
                    </div>

                    <Separator className="my-4 bg-slate-200/50 dark:bg-slate-800/50 opacity-50" />

                    {/* Lessons List */}
                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-2 pb-6">
                            {course.lessons.map((lesson, index) => {
                                const isActive = activeLesson?.id === lesson.id;

                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => setActiveLesson(lesson)}
                                        className={cn(
                                            "group flex cursor-pointer flex-col gap-1 rounded-xl p-3 transition-all duration-200 border border-transparent",
                                            isActive
                                                ? "bg-sky-50 border-sky-100 dark:bg-sky-900/10 dark:border-sky-900/30"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                                                isActive ? "border-sky-500 text-sky-500 bg-sky-100 dark:bg-sky-900/40" :
                                                    "border-slate-300 text-slate-400 dark:border-slate-700 bg-transparent"
                                            )}>
                                                <span className="text-xs font-bold">{index + 1}</span>
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
            <main className="flex-1 overflow-y-auto w-full relative pt-16 lg:pt-0 bg-slate-50/50 dark:bg-slate-950/50">
                {activeLesson ? (
                    <div className="mx-auto max-w-5xl p-6 lg:p-10 space-y-8">

                        {/* Toolbar */}
                        <div className="flex items-center justify-between sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-500">Editing Mode</span>
                            </div>
                            <div className="flex gap-3">
                                {isEditingLesson ? (
                                    <>
                                        <Button variant="outline" onClick={() => setIsEditingLesson(false)}>Cancel</Button>
                                        <Button onClick={handleSaveChanges} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            <Save className="mr-2 h-4 w-4" /> Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsEditingLesson(true)} variant="outline">
                                        <Edit className="mr-2 h-4 w-4" /> Edit Lesson
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Video Player Wrapper */}
                        <div className="space-y-4">
                            {isEditingLesson && (
                                <div className="space-y-2">
                                    <Label>Video URL</Label>
                                    <Input
                                        value={editedVideoId}
                                        onChange={(e) => setEditedVideoId(e.target.value)}
                                        placeholder="Enter VDCipher video ID"
                                    />
                                </div>
                            )}
                            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-2xl dark:border-slate-800 group">
                                {/* Simulated Video Player */}
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 cursor-pointer text-white">
                                            <PlayCircle className="h-10 w-10 fill-current" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-400">
                                            {activeLesson.videoId ? 'Video Ready' : 'No Video ID'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lesson Content Editor */}
                        <div className="max-w-3xl space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-sky-600 dark:text-sky-400">
                                    <Sparkles className="h-4 w-4" />
                                    <span>Lesson {course.lessons.findIndex(l => l.id === activeLesson.id) + 1}</span>
                                </div>
                                {isEditingLesson ? (
                                    <Input
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="text-4xl font-extrabold h-auto py-2 px-0 border-0 border-b border-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-sky-500 bg-transparent placeholder:text-slate-300"
                                        placeholder="Lesson Title"
                                    />
                                ) : (
                                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                                        {activeLesson.title}
                                    </h1>
                                )}
                            </div>

                            {isEditingLesson ? (
                                <div className="space-y-2">
                                    <Label>Description & Content</Label>
                                    <RichTextEditor
                                        value={editedDescription}
                                        onChange={setEditedDescription}
                                        placeholder="Enter lesson details..."
                                        className="min-h-[300px]"
                                    />
                                </div>
                            ) : (
                                <div
                                    className="prose prose-slate dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: activeLesson.description || '<p class="text-slate-500 italic">No description added yet.</p>' }}
                                />
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">
                        Select a lesson to edit
                    </div>
                )}
            </main>

            {/* Add Lesson Dialog */}
            <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Lesson</DialogTitle>
                        <DialogDescription>
                            Create a new lesson. You can add details and video later.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddLesson} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Lesson Title</Label>
                            <Input
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                placeholder="Introduction to..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddLessonOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Lesson</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
