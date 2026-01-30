export interface User {
    id: string;
    name: string;
    email: string;
    role: 'teacher' | 'student' | 'admin' | string;
    avatar?: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
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
    categoryId?: string;
    category?: Category;
    teacherId?: string;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    enrolledCourses: string[]; // Keep for specific overrides?
    enrolledCategories?: string[]; // New
    progress: Record<string, number>;
    joinDate: string;
}
