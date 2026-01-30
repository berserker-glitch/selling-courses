import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, Play, CheckCircle, Clock, Award, Layers, Download, FileText, ListChecks, Sparkles } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Progress } from '@/components/ui/progress';
import { mockCourses, studentLessonProgress, Course, Lesson } from '@/lib/mock-data';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface User {
  name: string;
  email: string;
  role: string;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(studentLessonProgress);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.role !== 'student') {
        navigate('/login');
        return;
      }
      setUser(userData);
    } else {
      navigate('/login');
    }

    // Find the course
    if (courseId) {
      const foundCourse = mockCourses.find(c => c.id === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        navigate('/student'); // Course not found, go back to dashboard
      }
    }
  }, [navigate, courseId]);

  const handleCompleteLesson = () => {
    if (!course || !course.lessons[selectedLessonIndex]) return;
    const lessonId = course.lessons[selectedLessonIndex].id;
    const updated = { ...completedLessons, [lessonId]: true };
    setCompletedLessons(updated);

    if (selectedLessonIndex < course.lessons.length - 1) {
      setSelectedLessonIndex(selectedLessonIndex + 1);
    }
  };

  const handleSelectLesson = (index: number) => {
    setSelectedLessonIndex(index);
  };

  const metrics = useMemo(() => {
    if (!course) {
      return {
        totalLessons: 0,
        completedCount: 0,
        progress: 0,
        totalDuration: 0,
      };
    }

    const totalLessons = course.lessons.length;
    const completedCount = course.lessons.filter((lesson) => completedLessons[lesson.id]).length;
    const totalDuration = course.lessons.reduce((sum, lesson) => {
      const [hours, minutes] = lesson.duration.split(':').map(Number);
      const mins = (hours || 0) * 60 + (minutes || 0);
      return sum + (isNaN(mins) ? 0 : mins);
    }, 0);
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      totalLessons,
      completedCount,
      progress,
      totalDuration,
    };
  }, [course, completedLessons]);

  if (!user || !course) return null;

  const selectedLesson = course.lessons[selectedLessonIndex];
  const isSelectedLessonCompleted = selectedLesson ? completedLessons[selectedLesson.id] || false : false;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 selection:bg-sky-500/30">
      {/* Aurora Background - Sky/Blue Theme */}
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Navbar with blur */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/50">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student')} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              Lern. <span className="font-normal text-slate-400 text-sm hidden md:inline-block">/ {course.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</span>
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{metrics.progress}%</span>
            </div>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${metrics.progress}%` }}></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 flex flex-col lg:flex-row gap-8">

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">
          {selectedLesson ? (
            <div className="space-y-6">
              {/* Video Player Container */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-2xl dark:border-slate-800">
                <VideoPlayer
                  lesson={selectedLesson}
                  onPrevious={selectedLessonIndex > 0 ? () => setSelectedLessonIndex(selectedLessonIndex - 1) : undefined}
                  onNext={selectedLessonIndex < course.lessons.length - 1 ? () => setSelectedLessonIndex(selectedLessonIndex + 1) : undefined}
                  onComplete={handleCompleteLesson}
                  hasPrevious={selectedLessonIndex > 0}
                  hasNext={selectedLessonIndex < course.lessons.length - 1}
                  isCompleted={isSelectedLessonCompleted}
                />
              </div>

              {/* Lesson Info */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{selectedLesson.title}</h1>
                    <div className="mt-2 flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/50">
                        <Clock className="h-3.5 w-3.5" /> {selectedLesson.duration}
                      </span>
                      {isSelectedLessonCompleted && (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                  {!isSelectedLessonCompleted && (
                    <Button
                      onClick={handleCompleteLesson}
                      className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg shadow-sky-500/20"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  )}
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedLesson.description}
                  </p>
                </div>
              </div>

              {/* Resources Spotlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                <SpotlightCard className="group cursor-pointer">
                  <div className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-50">Lesson Notes</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Download PDF summary</p>
                    </div>
                    <Download className="ml-auto h-4 w-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
                  </div>
                </SpotlightCard>

                <SpotlightCard className="group cursor-pointer">
                  <div className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
                      <ListChecks className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-50">Practice Quiz</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Test your knowledge</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                  </div>
                </SpotlightCard>
              </div>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                <Play className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Select a Lesson</h3>
              <p className="text-slate-500">Choose a video from the playlist to begin learning.</p>
            </div>
          )}
        </div>

        {/* Sidebar / Playlist */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="rounded-2xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40 sticky top-24">
            <div className="p-6 border-b border-white/10 dark:border-white/5">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-500" />
                Course Playlist
              </h2>
              <p className="text-sm text-slate-500">
                {metrics.completedCount} / {metrics.totalLessons} completed
              </p>
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-2">
              {course.lessons.map((lesson, index) => {
                const isActive = selectedLessonIndex === index;
                const isCompleted = completedLessons[lesson.id];

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(index)}
                    className={`w-full group flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${isActive
                        ? 'bg-slate-900 text-white shadow-lg shadow-sky-900/20 dark:bg-white dark:text-slate-900'
                        : 'hover:bg-white/60 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${isActive
                        ? 'bg-sky-500 text-white'
                        : isCompleted
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate pr-2">{lesson.title}</h4>
                      <p className={`text-xs mt-0.5 flex items-center gap-1.5 ${isActive ? 'text-slate-400 dark:text-slate-500' : 'text-slate-400'
                        }`}>
                        <Clock className="h-3 w-3" /> {lesson.duration}
                      </p>
                    </div>
                    {isActive && (
                      <div className="self-center">
                        <Play className="h-3 w-3 fill-current animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
