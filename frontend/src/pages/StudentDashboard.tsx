import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, LogOut, User, ArrowRight, Sparkles } from 'lucide-react';
import { mockCourses, studentCourseProgress } from '@/lib/mock-data';
import api from '@/lib/api';

interface UserData {
  name: string;
  email: string;
  role: string;
}

const SpotlightCard = ({
  children,
  className = "",
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setOpacity(1);
  };

  const handleBlur = () => {
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14, 165, 233, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

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

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses'); // Assuming endpoint returns courses
        setEnrolledCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 selection:bg-sky-500/30">

      {/* Aurora Background - Sky/Blue Theme */}
      <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Navbar with blur */}
      <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/50 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-black">
              <Sparkles className="h-4 w-4" />
            </div>
            Lern.
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors">
              Explore
            </span>
            <span className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors">
              Community
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-20">

        {/* Editorial Header */}
        <div className="mb-20 space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
            Keep <span className="text-sky-600 dark:text-sky-400">Growing.</span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Pick up where you left off. Your journey to mastery is just getting started.
            Dive back into your active modules.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => {
            const progress = studentCourseProgress[course.id] || 0;
            const isStarted = progress > 0;

            return (
              <SpotlightCard
                key={course.id}
                className="cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500"
                onClick={() => handleOpenCourse(course.id)}
              >
                <div className="flex flex-col h-full p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400">
                      {course.thumbnail ? (
                        <span className="text-xl">{course.thumbnail}</span>
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    {isStarted && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {progress}% Complete
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 text-xl font-bold tracking-tight">{course.title}</h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {course.description || "Master the concepts with our comprehensive curriculum designed for professionals."}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {course.lessons.length} Modules
                      </span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                        {isStarted ? 'Resume' : 'Start'}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    {isStarted && (
                      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full bg-sky-500 transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
