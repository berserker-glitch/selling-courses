export interface User {
    id: string;
    name: string;
    email: string;
    role: 'teacher' | 'student' | 'admin' | string;
    avatar?: string;
}

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
    completed?: boolean;
    description?: string;
    order?: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    lessons: Lesson[];
    progress?: number;
    enrolledStudents?: number;
    category: string;
    teacherId?: string;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    enrolledCourses: string[];
    progress: Record<string, number>;
    joinDate: string;
}
