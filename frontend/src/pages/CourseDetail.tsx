import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft, Play, CheckCircle, Clock, Award, Layers, Download, FileText, ListChecks } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Progress } from '@/components/ui/progress';
import { mockCourses, studentLessonProgress, Course, Lesson } from '@/lib/mock-data';

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
    <div className="flex min-h-screen flex-col bg-background">

      {/* Mobile lesson selector */}
      <section className="border-b-[3px] border-foreground bg-card px-4 py-6 shadow-neo md:hidden">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase text-foreground">Playlist</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/student')}
            className="rounded-none border-[3px] border-foreground bg-card shadow-neo-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {course.lessons.map((lesson, index) => {
            const isActive = index === selectedLessonIndex;
            const isCompleted = completedLessons[lesson.id];

            return (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(index)}
                className={`w-full rounded-none border-[3px] border-foreground p-4 text-left shadow-neo-xs transition-transform duration-150 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center border-[3px] border-foreground text-sm font-black ${isActive ? 'bg-card text-foreground' : 'bg-muted'}`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-black uppercase">{lesson.title}</div>
                    {lesson.description && (
                      <p className={`text-xs font-semibold uppercase ${isActive ? 'text-primary-foreground/80' : 'text-foreground/60'} line-clamp-2`}>
                        {lesson.description}
                      </p>
                    )}
                    <div className={`flex items-center gap-2 text-[0.65rem] font-semibold uppercase ${isActive ? 'text-primary-foreground/90' : 'text-foreground/50'}`}>
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                      {isCompleted && <span>Done</span>}
                    </div>
                  </div>
                  {isActive && !isCompleted && <Play className="mt-1 h-4 w-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex w-full flex-1 flex-col md:flex-row">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden md:flex md:w-80 md:flex-col md:border-r-[3px] md:border-foreground md:bg-card md:shadow-neo">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="flex items-center justify-between border-b-[3px] border-foreground px-6 py-5">
              <div>
                <h2 className="text-lg font-black uppercase text-foreground">Lesson Playlist</h2>
                <p className="mt-1 text-[11px] font-semibold uppercase text-foreground/60">Click any card to jump ahead</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/student')}
                className="rounded-none border-[3px] border-foreground bg-card shadow-neo-xs"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    className={`w-full rounded-none border-[3px] border-foreground p-4 text-left shadow-neo-xs transition-transform duration-150 ${
                      index === selectedLessonIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:-translate-y-[2px] hover:-translate-x-[2px]'
                    }`}
                    onClick={() => handleSelectLesson(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center border-[3px] border-foreground ${completedLessons[lesson.id] ? 'bg-success text-success-foreground' : 'bg-muted text-foreground'} text-sm font-black`}>
                        {completedLessons[lesson.id] ? <CheckCircle className="h-5 w-5" /> : index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="text-sm font-black uppercase">{lesson.title}</div>
                        {lesson.description && (
                          <p className="text-xs font-semibold uppercase text-foreground/60 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase text-foreground/60">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                          {completedLessons[lesson.id] && <span>Completed</span>}
                        </div>
                      </div>
                      {index === selectedLessonIndex && !completedLessons[lesson.id] && (
                        <Play className="mt-1 h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 bg-background px-4 py-6 md:px-8 md:py-10">
          {selectedLesson ? (
            <div className="mx-auto w-full max-w-8xl space-y-8">
              <VideoPlayer
                lesson={selectedLesson}
                onPrevious={selectedLessonIndex > 0 ? () => setSelectedLessonIndex(selectedLessonIndex - 1) : undefined}
                onNext={selectedLessonIndex < course.lessons.length - 1 ? () => setSelectedLessonIndex(selectedLessonIndex + 1) : undefined}
                onComplete={handleCompleteLesson}
                hasPrevious={selectedLessonIndex > 0}
                hasNext={selectedLessonIndex < course.lessons.length - 1}
                isCompleted={isSelectedLessonCompleted}
              />

              {selectedLesson.description && (
                <div className="rounded-none border-[3px] border-foreground bg-card p-6 shadow-neo">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-black uppercase text-foreground md:text-3xl">{selectedLesson.title}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase text-foreground/60">{selectedLesson.duration}</p>
                    </div>
                    {isSelectedLessonCompleted && (
                      <span className="inline-flex items-center gap-2 rounded-none border-[3px] border-foreground bg-success px-3 py-1 text-xs font-semibold uppercase text-success-foreground shadow-neo-xs">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground/70">
                    {selectedLesson.description}
                  </p>
                </div>
              )}

              {!isSelectedLessonCompleted && (
                <Button
                  className="rounded-none border-[3px] border-foreground shadow-neo-xs"
                  onClick={handleCompleteLesson}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Lesson Complete
                </Button>
              )}

              {/* Lesson Resources */}
              <div className="rounded-none border-[3px] border-foreground bg-card p-6 shadow-neo">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase text-foreground">Next Actions</h3>
                    <p className="text-xs font-semibold uppercase text-foreground/60">Keep the momentum going.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase">
                    <Button variant="secondary" className="rounded-none border-[3px] border-foreground shadow-neo-xs">
                      <ListChecks className="mr-2 h-4 w-4" />
                      Practice Quiz
                    </Button>
                    <Button variant="secondary" className="rounded-none border-[3px] border-foreground shadow-neo-xs">
                      <FileText className="mr-2 h-4 w-4" />
                      Review Notes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-btn gap-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center border-[3px] border-foreground bg-muted text-foreground shadow-neo">
                <BookOpen className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-black uppercase text-foreground">Select a Lesson</h3>
              <p className="text-xs font-semibold uppercase text-foreground/60">
                Choose a lesson from the playlist to start watching.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
