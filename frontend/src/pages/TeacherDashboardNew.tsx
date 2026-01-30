import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { CourseManagement } from '@/components/teacher/CourseManagement';
import { StudentManagement } from '@/components/teacher/StudentManagement';
import { useToast } from '@/hooks/use-toast';
import { mockCourses, mockStudents, Course, Student, Lesson } from '@/lib/mock-data';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function TeacherDashboardNew() {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeSection, setActiveSection] = useState('courses');
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.role !== 'teacher') {
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

  // Course Management Functions
  const handleAddCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      lessons: [],
      enrolledStudents: 0
    };
    setCourses([...courses, newCourse]);
    toast({
      title: "Course created!",
      description: `${newCourse.title} has been added successfully.`,
    });
  };

  const handleEditCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses(courses.map(course =>
      course.id === courseId ? { ...course, ...updates } : course
    ));
    toast({
      title: "Course updated",
      description: "Course has been updated successfully.",
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    // Remove course from student enrollments
    setStudents(students.map(student => ({
      ...student,
      enrolledCourses: student.enrolledCourses.filter(id => id !== courseId),
      progress: Object.fromEntries(
        Object.entries(student.progress).filter(([key]) => key !== courseId)
      )
    })));
    toast({
      title: "Course deleted",
      description: "The course has been removed successfully.",
    });
  };

  // Lesson Management Functions
  const handleAddLesson = (courseId: string, lessonData: Omit<Lesson, 'id'>) => {
    const newLesson: Lesson = {
      ...lessonData,
      id: `lesson-${Date.now()}`
    };

    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, lessons: [...course.lessons, newLesson] }
        : course
    ));

    toast({
      title: "Lesson added",
      description: `${newLesson.title} has been added to the course.`,
    });
  };

  const handleEditLesson = (courseId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses(courses.map(course =>
      course.id === courseId
        ? {
          ...course,
          lessons: course.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
          )
        }
        : course
    ));

    toast({
      title: "Lesson updated",
      description: "Lesson has been updated successfully.",
    });
  };

  const handleDeleteLesson = (courseId: string, lessonId: string) => {
    setCourses(courses.map(course =>
      course.id === courseId
        ? { ...course, lessons: course.lessons.filter(l => l.id !== lessonId) }
        : course
    ));

    toast({
      title: "Lesson deleted",
      description: "The lesson has been removed from the course.",
    });
  };

  // Student Management Functions
  const handleAddStudent = (studentData: Omit<Student, 'id' | 'enrolledCourses' | 'progress'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      enrolledCourses: [],
      progress: {}
    };
    setStudents([...students, newStudent]);
    toast({
      title: "Student added!",
      description: `${newStudent.name} has been added successfully.`,
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
    toast({
      title: "Student removed",
      description: "The student has been removed successfully.",
    });
  };


  const renderContent = () => {
    switch (activeSection) {
      case 'courses':
        return (
          <CourseManagement
            courses={courses}
            students={students}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddLesson={handleAddLesson}
            onEditLesson={handleEditLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        );
      case 'students':
        return (
          <StudentManagement
            students={students}
            courses={courses}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <TeacherSidebar
        user={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-6xl space-y-10 px-10 py-12">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
