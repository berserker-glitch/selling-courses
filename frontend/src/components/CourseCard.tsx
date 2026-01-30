import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Users, Clock, BookOpen } from 'lucide-react';
import { Course } from '@/lib/mock-data';

interface CourseCardProps {
  course: Course;
  progress?: number;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isTeacher?: boolean;
}

export function CourseCard({ course, progress, onStart, onEdit, onDelete, isTeacher = false }: CourseCardProps) {
  const totalDuration = course.lessons.reduce((acc, lesson) => {
    const [minutes, seconds] = lesson.duration.split(':').map(Number);
    return acc + minutes + (seconds / 60);
  }, 0);

  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="text-4xl">{course.thumbnail}</div>
          {isTeacher && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                ✏️
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                🗑️
              </Button>
            </div>
          )}
        </div>
        <CardTitle className="text-xl">
          {course.title}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 p-2">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons.length} lessons</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 p-2">
            <Clock className="h-4 w-4" />
            <span>{Math.round(totalDuration)}m total</span>
          </div>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2 rounded-md bg-secondary/50 p-3 text-xs font-medium">
            <Users className="h-4 w-4" />
            <span>{course.enrolledStudents} students</span>
          </div>
        )}

        {!isTeacher && typeof progress === "number" && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        <Button onClick={onStart} className="w-full" variant={progress === 100 ? "secondary" : "default"}>
          <Play className="h-4 w-4" />
          {isTeacher ? "Manage Course" : progress === 100 ? "Review" : progress && progress > 0 ? "Continue" : "Start Learning"}
        </Button>
      </CardContent>
    </Card>
  );
}