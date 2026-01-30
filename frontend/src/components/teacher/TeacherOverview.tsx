import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Activity,
  Calendar,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Course, Student } from '@/lib/mock-data';

interface TeacherOverviewProps {
  courses: Course[];
  students: Student[];
  onSectionChange: (section: string) => void;
}

export function TeacherOverview({ courses, students, onSectionChange }: TeacherOverviewProps) {
  // Calculate stats
  const totalEnrollments = students.reduce((sum, student) => sum + student.enrolledCourses.length, 0);
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const activeStudents = students.filter(student =>
    Object.values(student.progress).some(progress => progress > 0)
  ).length;

  const recentActivity = [
    { type: 'enrollment', message: 'New student enrolled in React Basics', time: '2 hours ago' },
    { type: 'completion', message: 'Sarah completed JavaScript Fundamentals', time: '4 hours ago' },
    { type: 'course', message: 'New course "Advanced CSS" was created', time: '1 day ago' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              Control Center
            </span>
            <h1 className="text-4xl font-bold text-foreground">
              Dashboard Overview
            </h1>
            <p className="max-w-2xl text-sm font-medium text-muted-foreground">
              Monitor everything at a glance. Keep teaching bold, structured, and fearless.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-medium uppercase">
            <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-right shadow-sm">
              <span className="text-muted-foreground">Courses</span>
              <span className="text-3xl font-bold text-foreground">{courses.length}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-right shadow-sm">
              <span className="text-muted-foreground">Students</span>
              <span className="text-3xl font-bold text-foreground">{students.length}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-right shadow-sm">
              <span className="text-muted-foreground">Active</span>
              <span className="text-3xl font-bold text-foreground">{activeStudents}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-right shadow-sm">
              <span className="text-muted-foreground">Lessons</span>
              <span className="text-3xl font-bold text-foreground">{totalLessons}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-6 p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase">Actions</h2>
            <p className="text-sm font-medium text-foreground/70">Launch powerful tools and build your next big lesson block.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Button className="justify-start" onClick={() => onSectionChange('courses')}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => onSectionChange('students')}>
              <Users className="h-4 w-4" />
              Add Student
            </Button>
            <Button variant="ghost" className="justify-start">
              <TrendingUp className="h-4 w-4" />
              View Analytics
            </Button>
            <Button variant="ghost" className="justify-start">
              <Calendar className="h-4 w-4" />
              Schedule Session
            </Button>
          </div>
        </Card>

        <Card className="space-y-4 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase">Latest Signals</h2>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Course Performance */}
      <Card className="space-y-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black uppercase">Course Performance</h2>
          <Button variant="ghost" size="sm">
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {courses.slice(0, 3).map((course) => {
            const enrolledStudents = students.filter(student =>
              student.enrolledCourses.includes(course.id)
            ).length;
            const avgProgress = enrolledStudents > 0 ?
              Math.round(students.reduce((sum, student) =>
                sum + (student.progress[course.id] || 0), 0
              ) / enrolledStudents) : 0;

            return (
              <div
                key={course.id}
                className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary text-2xl text-primary-foreground">
                    {course.thumbnail}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {enrolledStudents} students • {course.lessons.length} lessons
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-6">
                  <div className="text-right">
                    <div className="text-sm font-bold">{avgProgress}% avg</div>
                    <Progress value={avgProgress} className="mt-2 h-3 w-36" />
                  </div>
                  <Badge variant="secondary" className="font-medium">{enrolledStudents} Enrolled</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
