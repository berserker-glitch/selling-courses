import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Play, LogOut, User, ArrowRight, Sparkles,
  Trophy, Clock, GraduationCap, TrendingUp, CheckCircle
} from 'lucide-react';
import { Course } from '@/types';
import api from '@/lib/api';
import { cn } from "@/lib/utils";

/**
 * User data interface for authenticated students
 */
interface UserData {
  name: string;
  email: string;
  role: string;
}

/**
 * SpotlightCard - Interactive card with mouse-following spotlight effect
 * Creates a premium glass-morphism feel with subtle hover glow.
 */
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

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 ${className}`}
    >
      {/* Spotlight gradient overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.12), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

/**
 * ProgressRing - Circular progress indicator
 * Displays completion percentage in a visual ring format.
 */
const ProgressRing = ({ progress, size = 48 }: { progress: number; size?: number }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
      </div>
    </div>
  );
};

/**
 * StudentDashboard - Main dashboard for student learning experience
 * Features: Course grid, progress tracking, stats overview
 */
export default function StudentDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const themeColor = '#3b82f6'; // Blue-500 theme

  // Authentication check
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.role !== 'STUDENT') {
        navigate('/login');
        return;
      }
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/courses');
        setEnrolledCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleOpenCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (!user) return null;

  // Calculate overall stats
  const totalCourses = enrolledCourses.length;
  const totalLessons = enrolledCourses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const completedLessons = enrolledCourses.reduce(
    (sum, c) => sum + (c.lessons?.filter((l: any) => l.completed)?.length || 0), 0
  );
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Sidebar - Consistent with CourseDetail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:relative lg:translate-x-0 flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: themeColor }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span>Academy</span>
          </div>

          <p className="text-white/80 text-sm leading-relaxed">
            Welcome back, <br />
            <span className="font-bold text-lg text-white">{user.name}</span>
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-medium shadow-sm transition-all border border-white/10">
            <BookOpen className="h-5 w-5" />
            My Courses
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white font-medium transition-all"
          >
            <User className="h-5 w-5" />
            Profile
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {(user?.name || '?')[0]}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Logged in as</p>
                <p className="text-white/70 truncate max-w-[120px]">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 relative">
        {/* Decorative Background - Same as CourseDetail */}
        <div
          className="absolute top-0 inset-x-0 h-64 opacity-5 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${themeColor} 0%, transparent 100%)`
          }}
        />

        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
          <span className="font-bold text-slate-800">Academy</span>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <div className="space-y-1">
              <div className="w-5 h-0.5 bg-slate-600"></div>
              <div className="w-5 h-0.5 bg-slate-600"></div>
              <div className="w-5 h-0.5 bg-slate-600"></div>
            </div>
          </Button>
        </div>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">

          {/* Header Section */}
          <div className="relative z-10">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
              Track your progress and continue learning.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-white/5 flex items-center justify-center text-emerald-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalCourses}</p>
                <p className="text-sm font-medium text-slate-500">Enrolled Courses</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-blue-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{completedLessons}</p>
                <p className="text-sm font-medium text-slate-500">Lessons Completed</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-4">
              <div className="h-14 w-14">
                <ProgressRing progress={overallProgress} size={56} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{overallProgress}%</p>
                <p className="text-sm font-medium text-slate-500">Average Progress</p>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Courses</h2>
              {/* Browse Library button removed as requested */}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-slate-800">
                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No active courses</h3>
                <p className="text-slate-500 mb-6">Start your learning journey today.</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Browse Catalog
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => {
                  const completedCount = course.lessons?.filter((l: any) => l.completed)?.length || 0;
                  const totalCount = course.lessons?.length || 0;
                  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const isStarted = completedCount > 0;
                  const isCompleted = progress === 100;
                  // Use course theme color if available, else default
                  const cardTheme = course.themeColor || themeColor;

                  return (
                    <SpotlightCard
                      key={course.id}
                      className="cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 border-slate-200/60"
                      onClick={() => handleOpenCourse(course.id)}
                    >
                      <div className="flex flex-col h-full p-6 relative">
                        {/* Top Color Accent */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: cardTheme }}
                        />

                        <div className="mb-5 flex items-start justify-between">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                            style={{ backgroundColor: cardTheme }}
                          >
                            <BookOpen className="h-6 w-6" />
                          </div>
                          {isStarted && <div className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                            {progress}%
                          </div>}
                        </div>

                        <div className="flex-1 mb-6">
                          <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-[var(--theme-color)] transition-colors"
                            style={{ '--theme-color': cardTheme } as React.CSSProperties}
                          >
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {course.description || "Master the fundamentals with professional guidance."}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
                            <span>Progress</span>
                            <span>{completedCount}/{totalCount} Lessons</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%`, backgroundColor: cardTheme }}
                            />
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
