export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  avatar?: string;
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
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed?: boolean;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  progress: Record<string, number>;
  joinDate: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'teacher-1',
    name: 'Sarah Johnson',
    email: 'sarah@teacher.com',
    role: 'teacher',
    avatar: '👩‍🏫'
  },
  {
    id: 'student-1',
    name: 'Alex Smith',
    email: 'alex@student.com',
    role: 'student',
    avatar: '👨‍🎓'
  },
  {
    id: 'student-2',
    name: 'Emma Wilson',
    email: 'emma@student.com',
    role: 'student',
    avatar: '👩‍🎓'
  }
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Introduction to Mathematics',
    description: 'Basic mathematical concepts and problem-solving techniques',
    thumbnail: '🔢',
    category: 'Mathematics',
    enrolledStudents: 24,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Numbers and Operations',
        duration: '15:30',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        description: 'Learn about basic number operations and arithmetic'
      },
      {
        id: 'lesson-1-2',
        title: 'Fractions and Decimals',
        duration: '18:45',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        description: 'Understanding fractions, decimals, and their relationships'
      },
      {
        id: 'lesson-1-3',
        title: 'Basic Algebra',
        duration: '22:15',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        description: 'Introduction to variables and simple equations'
      }
    ]
  },
  {
    id: 'course-2',
    title: 'English Literature',
    description: 'Explore classic and modern literature with critical analysis',
    thumbnail: '📚',
    category: 'Literature',
    enrolledStudents: 18,
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Poetry Fundamentals',
        duration: '20:00',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        description: 'Understanding meter, rhyme, and poetic devices'
      },
      {
        id: 'lesson-2-2',
        title: 'Character Analysis',
        duration: '25:30',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        description: 'How to analyze characters in literature'
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Basic Science',
    description: 'Fundamental scientific concepts and experiments',
    thumbnail: '🔬',
    category: 'Science',
    enrolledStudents: 32,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Scientific Method',
        duration: '16:20',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        description: 'Learn the steps of scientific inquiry'
      },
      {
        id: 'lesson-3-2',
        title: 'States of Matter',
        duration: '19:45',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        description: 'Solid, liquid, gas, and plasma states'
      },
      {
        id: 'lesson-3-3',
        title: 'Simple Machines',
        duration: '23:10',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        description: 'Understanding levers, pulleys, and inclined planes'
      }
    ]
  }
];

// Mock Students (for teacher view)
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: 'Alex Smith',
    email: 'alex@student.com',
    enrolledCourses: ['course-1', 'course-3'],
    progress: {
      'course-1': 67,
      'course-3': 33
    },
    joinDate: '2024-01-15'
  },
  {
    id: 'student-2',
    name: 'Emma Wilson',
    email: 'emma@student.com',
    enrolledCourses: ['course-1', 'course-2'],
    progress: {
      'course-1': 100,
      'course-2': 50
    },
    joinDate: '2024-01-20'
  },
  {
    id: 'student-3',
    name: 'Mike Johnson',
    email: 'mike@student.com',
    enrolledCourses: ['course-2', 'course-3'],
    progress: {
      'course-2': 25,
      'course-3': 80
    },
    joinDate: '2024-02-01'
  },
  {
    id: 'student-4',
    name: 'Sophie Brown',
    email: 'sophie@student.com',
    enrolledCourses: ['course-1'],
    progress: {
      'course-1': 45
    },
    joinDate: '2024-02-10'
  }
];

// Student course progress (for student view)
export const studentCourseProgress: Record<string, number> = {
  'course-1': 67,
  'course-2': 0,
  'course-3': 33
};

// Student lesson progress
export const studentLessonProgress: Record<string, boolean> = {
  'lesson-1-1': true,
  'lesson-1-2': true,
  'lesson-1-3': false,
  'lesson-3-1': true,
  'lesson-3-2': false,
  'lesson-3-3': false
};