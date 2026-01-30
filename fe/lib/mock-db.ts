
export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
    id: string;
    username: string;
    email: string;
    studentNumber?: string;
    role: UserRole;
    password?: string; // For mock login only
    accessCourseIds: string[];
    isBanned: boolean;
    loginHistory: { timestamp: string; ip: string; device: string }[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
}

export interface Video {
    id: string;
    courseId: string;
    title: string;
    duration: string; // e.g. "12:30"
    vdocipherId: string; // Mock ID
}

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    metadata: any;
    timestamp: string;
    ip: string;
}

// --- MOCK DATA ---

const MOCK_COURSES: Course[] = [
    {
        id: 'c1',
        title: 'Advanced Calculus I',
        description: 'Deep dive into limits, derivatives, and integrals.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    },
    {
        id: 'c2',
        title: 'Linear Algebra Masterclass',
        description: 'Vector spaces, matrices, and linear transformations.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
    }
];

const MOCK_VIDEOS: Video[] = [
    { id: 'v1', courseId: 'c1', title: 'Lecture 1: Limits', duration: '45:00', vdocipherId: 'mock-vdo-1' },
    { id: 'v2', courseId: 'c1', title: 'Lecture 2: Derivatives', duration: '50:30', vdocipherId: 'mock-vdo-2' },
    { id: 'v3', courseId: 'c2', title: 'Lecture 1: Vectors', duration: '60:00', vdocipherId: 'mock-vdo-3' },
];

const MOCK_USERS: User[] = [
    {
        id: 'admin1',
        username: 'admin',
        email: 'admin@mohibimaths.com',
        role: 'ADMIN',
        accessCourseIds: [],
        isBanned: false,
        loginHistory: [],
        password: 'password123'
    },
    {
        id: 's1',
        username: 'john_doe',
        email: 'john@student.com',
        studentNumber: 'MM-2024-001',
        role: 'STUDENT',
        accessCourseIds: ['c1'], // Only access to Calculus
        isBanned: false,
        loginHistory: [],
        password: 'password123'
    }
];

let AUDIT_LOGS: AuditLog[] = [];

// --- API MOCKS ---

export const db = {
    users: {
        findUnique: (identifier: { username?: string; id?: string }) => {
            return MOCK_USERS.find(u =>
                (identifier.username && u.username === identifier.username) ||
                (identifier.id && u.id === identifier.id)
            );
        },
        create: (user: User) => {
            MOCK_USERS.push(user);
            return user;
        },
        update: (id: string, data: Partial<User>) => {
            const idx = MOCK_USERS.findIndex(u => u.id === id);
            if (idx === -1) throw new Error('User not found');
            MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data };
            return MOCK_USERS[idx];
        },
        all: () => MOCK_USERS,
    },
    courses: {
        all: () => MOCK_COURSES,
        findById: (id: string) => MOCK_COURSES.find(c => c.id === id)
    },
    videos: {
        byCourseId: (courseId: string) => MOCK_VIDEOS.filter(v => v.courseId === courseId),
        findById: (id: string) => MOCK_VIDEOS.find(v => v.id === id)
    },
    logs: {
        add: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
            const newLog: AuditLog = {
                ...log,
                id: Math.random().toString(36).substring(7),
                timestamp: new Date().toISOString()
            };
            AUDIT_LOGS.unshift(newLog);
            return newLog;
        },
        all: () => AUDIT_LOGS
    }
};
