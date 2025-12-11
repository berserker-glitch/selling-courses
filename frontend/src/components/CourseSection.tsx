import { CourseCard } from '@/components/CourseCard';
import { Course } from '@/lib/mock-data';

interface CourseSectionProps {
  title: string;
  courses: Course[];
  progress: Record<string, number>;
  onStartCourse: (course: Course) => void;
  showProgress?: boolean;
}

export function CourseSection({ title, courses, progress, onStartCourse, showProgress = true }: CourseSectionProps) {
  if (courses.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            progress={showProgress ? progress[course.id] : undefined}
            onStart={() => onStartCourse(course)}
          />
        ))}
      </div>
    </div>
  );
}