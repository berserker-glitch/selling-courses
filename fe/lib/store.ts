
import { User, db } from './mock-db';

// Simulate a session store
class SessionStore {
    private currentUser: User | null = null;
    private listeners: (() => void)[] = [];

    login(username: string, role: 'ADMIN' | 'STUDENT') {
        const user = db.users.findUnique({ username });
        if (user && user.role === role) {
            if (user.isBanned) throw new Error('Account is banned');
            this.currentUser = user;

            // Log login
            db.logs.add({
                userId: user.id,
                action: 'LOGIN',
                metadata: { device: 'Browser' },
                ip: '127.0.0.1'
            });

            this.notify();
            return true;
        }
        return false;
    }

    logout() {
        if (this.currentUser) {
            db.logs.add({
                userId: this.currentUser.id,
                action: 'LOGOUT',
                metadata: {},
                ip: '127.0.0.1'
            });
        }
        this.currentUser = null;
        this.notify();
    }

    getUser() {
        return this.currentUser;
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l());
    }
}

export const sessionStore = new SessionStore();
