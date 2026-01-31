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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">

      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Top gradient orb */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/20 rounded-full blur-3xl" />
        {/* Bottom gradient orb */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200/30 dark:bg-sky-900/20 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:linear-gradient(180deg,white,transparent)]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              Academy
            </span>
          </div>

          {/* Nav Links & User Actions */}
          <div className="flex items-center gap-6">
            <span className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors">
              My Courses
            </span>
            <span className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors">
              Browse
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* User Avatar */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Hero Section */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
              Welcome back, {user.name?.split(' ')[0]}
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
              Your Learning <span className="text-emerald-600 dark:text-emerald-400">Journey</span>
            </h1>
            <p className="max-w-xl text-slate-600 dark:text-slate-400">
              Continue where you left off. Track your progress and achieve your goals.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalCourses}</p>
                <p className="text-xs text-slate-500">Courses</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedLessons}/{totalLessons}</p>
                <p className="text-xs text-slate-500">Lessons Done</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 px-4 py-3 shadow-sm">
              <ProgressRing progress={overallProgress} size={42} />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{overallProgress}%</p>
                <p className="text-xs text-slate-500">Overall</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Courses</h2>
          <Button variant="outline" size="sm" className="text-sm">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && enrolledCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No courses yet</h3>
            <p className="text-slate-500 mb-6">Start learning by enrolling in your first course</p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Browse Courses
            </Button>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && enrolledCourses.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => {
              const completedCount = course.lessons?.filter((l: any) => l.completed)?.length || 0;
              const totalCount = course.lessons?.length || 0;
              const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const isStarted = completedCount > 0;
              const isCompleted = progress === 100;

              return (
                <SpotlightCard
                  key={course.id}
                  className="cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
                  onClick={() => handleOpenCourse(course.id)}
                >
                  <div className="flex flex-col h-full p-6">
                    {/* Course Header */}
                    <div className="mb-4 flex items-start justify-between">
                      {/* Course Icon */}
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/20">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      {/* Progress Ring */}
                      {isStarted && <ProgressRing progress={progress} size={44} />}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {course.description || "Master the fundamentals with hands-on lessons and expert guidance."}
                      </p>
                    </div>

                    {/* Course Footer */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Play className="h-3 w-3" />
                          {totalCount} lessons
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Trophy className="h-3 w-3" />
                            Completed!
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start'} <ArrowRight className="h-4 w-4" />
                        </span>
                        <span className="text-xs text-slate-400">
                          {completedCount}/{totalCount} done
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
