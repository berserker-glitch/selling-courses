import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, LogOut, User, ArrowRight, Sparkles } from 'lucide-react';
import { mockCourses, studentCourseProgress } from '@/lib/mock-data';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleOpenCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const enrolledCourses = mockCourses;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Subtle background element */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground/80">Learning Hub</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm font-medium text-muted-foreground md:flex">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-transparent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Minimal Header */}
        <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary">My Courses</h1>
            <p className="text-muted-foreground">Continue where you left off.</p>
          </div>
          <Button variant="link" className="group h-auto p-0 text-muted-foreground hover:text-primary hover:no-underline">
            View History
            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course, index) => {
            const progress = studentCourseProgress[course.id] || 0;
            const isStarted = progress > 0;

            return (
              <Card
                key={course.id}
                className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-muted/60 bg-card/50 backdrop-blur-sm"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleOpenCourse(course.id)}
              >
                <div onClick={(e) => { e.stopPropagation(); handleOpenCourse(course.id); }} className="absolute inset-0 z-10 cursor-pointer" />

                <CardContent className="p-0">
                  {/* Minimal Header Area with Icon */}
                  <div className="flex items-start justify-between p-6 pb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/50 text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    {isStarted ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        </span>
                        In Progress
                      </span>
                    ) : (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Not Started
                      </span>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {course.title}
                    </h3>
                    <p className="mb-6 line-clamp-2 text-sm text-muted-foreground">
                      {course.description || "Master the fundamentals and advanced concepts in this comprehensive module designed for success."}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">{course.lessons.length} Lessons</span>
                        <span className="text-foreground">{progress}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-1.5 bg-secondary"
                      />
                    </div>
                  </div>

                  {/* Hover Action */}
                  <div className="border-t bg-muted/30 px-6 py-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                      {isStarted ? 'Resume Learning' : 'Start Course'} <Play className="h-3 w-3 fill-current" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}