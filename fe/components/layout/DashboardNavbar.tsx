'use client';

import { sessionStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function DashboardNavbar() {
    const router = useRouter();
    const [user, setUser] = useState(sessionStore.getUser());

    useEffect(() => {
        // Subscribe to store updates if needed, or just relying on initial render + protected route checks
        // ideally store should emit updates, but for now we just get current user
        setUser(sessionStore.getUser());
    }, []);

    const handleLogout = () => {
        sessionStore.logout();
        router.push('/login');
    };

    return (
        <header className="border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Mohibi Maths
                    </span>
                </div>

                <nav className="flex items-center space-x-4" aria-label="User Menu">
                    <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50" role="status">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">{user?.username || 'Guest'}</span>
                            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">{user?.studentNumber || 'No ID'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground focus-visible:ring-2 focus-visible:ring-destructive"
                        aria-label="Log Out"
                        title="Sign out of your account"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </nav>
            </div>
        </header>
    );
}
