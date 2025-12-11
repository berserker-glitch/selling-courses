import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, LogOut, User, ArrowRight } from 'lucide-react';
import { mockCourses, studentCourseProgress, Course } from '@/lib/mock-data';

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

  // Get only enrolled courses (courses with progress > 0 or all for demo)
  const enrolledCourses = mockCourses;
  const nextCourse = enrolledCourses.find((course) => (studentCourseProgress[course.id] || 0) < 100) ?? enrolledCourses[0];

  const stats = [
    {
      label: 'Courses Active',
      value: enrolledCourses.length.toString(),
      accentClasses: 'bg-primary text-primary-foreground',
    },
    {
      label: 'Hours Logged',
      value: '42+',
      accentClasses: 'bg-secondary text-secondary-foreground',
    },
    {
      label: 'Achievements',
      value: '7',
      accentClasses: 'bg-accent text-accent-foreground',
    },
  ];

  if (!user) return null;

  return (
    <div className="bg-background">
      {/* Mobile layout */}
      <div className="flex min-h-screen flex-col md:hidden">
        <header className="border-b-[3px] border-foreground bg-card shadow-neo">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase text-foreground/60">Student Control</p>
              <h1 className="text-xl font-black uppercase text-foreground">{user.name}</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-none border-[3px] border-foreground px-4 shadow-neo-xs"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-4 py-6">
          {nextCourse && (
            <section className="space-y-4 rounded-none border-[3px] border-foreground bg-card p-5 shadow-neo">
              <span className="inline-flex w-max items-center gap-2 rounded-none border-[3px] border-foreground bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-secondary-foreground shadow-neo-xs">
                Continue Learning
              </span>
              <div>
                <h2 className="text-2xl font-black uppercase text-foreground">{nextCourse.title}</h2>
                <p className="mt-2 text-sm font-medium text-foreground/70 line-clamp-2">{nextCourse.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase text-foreground">
                  <span>Progress</span>
                  <span>{studentCourseProgress[nextCourse.id] || 0}%</span>
                </div>
                <Progress value={studentCourseProgress[nextCourse.id] || 0} className="h-3" />
              </div>
              <Button className="w-full" onClick={() => handleOpenCourse(nextCourse.id)}>
                <Play className="mr-2 h-4 w-4" />
                Resume Course
              </Button>
            </section>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-black uppercase text-foreground">Snapshot</h3>
            <div className="-mx-1 flex gap-3 overflow-x-auto pb-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[160px] flex-1 rounded-none border-[3px] border-foreground bg-card p-4 shadow-neo-xs"
                >
                  <p className="text-[10px] font-semibold uppercase text-foreground/60">{stat.label}</p>
                  <div
                    className={`mt-3 inline-flex items-center rounded-none border-[3px] border-foreground px-3 py-2 text-xl font-black uppercase shadow-neo-xs ${stat.accentClasses}`}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-foreground">Your Courses</h3>
              <Button variant="ghost" size="sm" className="rounded-none border-[3px] border-foreground px-3 shadow-neo-xs">
                View Archive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {enrolledCourses.length === 0 ? (
              <div className="rounded-none border-[3px] border-foreground bg-muted py-10 text-center text-xs font-semibold uppercase text-foreground/60 shadow-neo-xs">
                Add your first course to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledCourses.map((course) => {
                  const progress = studentCourseProgress[course.id] || 0;

                  return (
                    <Card key={course.id} className="rounded-none border-[3px] border-foreground bg-card shadow-neo-xs">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-none border-[3px] border-foreground bg-primary text-xl text-primary-foreground shadow-neo-xs">
                            {course.thumbnail}
                          </div>
                          <div>
                            <h4 className="text-base font-black uppercase text-foreground">{course.title}</h4>
                            <p className="text-xs font-semibold uppercase text-foreground/60">{course.lessons.length} lessons</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground/70 line-clamp-3">{course.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase text-foreground">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>
                        <Button className="w-full" onClick={() => handleOpenCourse(course.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          {progress > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block">
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b-[3px] border-foreground bg-card shadow-neo">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground shadow-neo-xs">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-foreground/60">Student Control Panel</p>
                  <h1 className="text-2xl font-black uppercase text-foreground">Learning Hub</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-none border-[3px] border-foreground bg-card px-4 py-2 text-sm font-semibold uppercase text-foreground shadow-neo-xs">
                  <User className="h-4 w-4" />
                  {user.name}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="mx-auto max-w-5xl px-8 py-12">
            <section className="mb-12 space-y-4 rounded-none border-[3px] border-foreground bg-card p-8 shadow-neo">
              <div className="flex flex-col gap-3 text-left">
                <span className="w-max rounded-none border-[3px] border-foreground bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-foreground shadow-neo-xs">
                  Welcome back
                </span>
                <h2 className="text-4xl font-black uppercase text-foreground">{user.name}, keep building</h2>
                <p className="max-w-xl text-sm font-medium text-foreground/70">
                  Your modules are waiting. Pick up where you left off or start fresh. Every block adds to your masterpiece.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 text-xs font-semibold uppercase text-foreground md:grid-cols-3">
                <div className="rounded-none border-[3px] border-foreground bg-primary px-4 py-3 text-primary-foreground shadow-neo-xs">
                  <p>Courses Active</p>
                  <p className="mt-2 text-3xl font-black">{enrolledCourses.length}</p>
                </div>
                <div className="rounded-none border-[3px] border-foreground bg-secondary px-4 py-3 text-secondary-foreground shadow-neo-xs">
                  <p>Hours Logged</p>
                  <p className="mt-2 text-3xl font-black">42+</p>
                </div>
                <div className="rounded-none border-[3px] border-foreground bg-accent px-4 py-3 text-accent-foreground shadow-neo-xs">
                  <p>Achievements</p>
                  <p className="mt-2 text-3xl font-black">7</p>
                </div>
              </div>
            </section>

            {/* Courses Grid */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black uppercase text-foreground">Your Courses</h3>
                <Button variant="ghost" size="sm">
                  View Archive
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {enrolledCourses.map((course) => {
                  const progress = studentCourseProgress[course.id] || 0;

                  return (
                    <Card
                      key={course.id}
                      className="cursor-pointer transition-transform duration-150 hover:-translate-y-1"
                      onClick={() => handleOpenCourse(course.id)}
                    >
                      <CardContent className="space-y-5 p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground shadow-neo-xs">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black uppercase text-foreground">{course.title}</h4>
                            <p className="text-xs font-semibold uppercase text-foreground/60">{course.lessons.length} Lessons</p>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-foreground/70 line-clamp-3">{course.description}</p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold uppercase text-foreground">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>

                        <Button className="w-full">
                          <Play className="h-4 w-4" />
                          {progress > 0 ? 'Continue Building' : 'Start Module'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Empty State */}
              {enrolledCourses.length === 0 && (
                <div className="mt-12 rounded-none border-[3px] border-foreground bg-card p-16 text-center shadow-neo">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-[3px] border-foreground bg-muted text-foreground shadow-neo-xs">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black uppercase text-foreground">No Courses Yet</h3>
                  <p className="mt-2 text-sm font-medium text-foreground/70">You haven't enrolled in any courses yet. Dive in and start your first build.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}