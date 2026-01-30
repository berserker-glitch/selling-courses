'use client';

import { useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const [isBlurry, setIsBlurry] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 1. Anti-DevTools & Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
                alert('Security Alert: Developer tools are disabled.');
                // In real app, log this violation
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        // 2. Tab Focus Detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurry(true);
                document.title = "🚫 SECURITY ALERT";
            } else {
                setIsBlurry(false);
                document.title = "Mohibi Maths";
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 3. Screen Share Detection (Mock - detecting window focus loss too aggressively)
        const handleBlur = () => {
            setIsBlurry(true);
        };

        const handleFocus = () => {
            setIsBlurry(false);
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return (
        <div className="relative min-h-screen">
            {isBlurry && (
                <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-2xl flex items-center justify-center text-white">
                    <div className="text-center p-8 max-w-md">
                        <h1 className="text-3xl font-bold mb-4 text-red-500">Security Mode Active</h1>
                        <p className="text-lg text-gray-300">
                            Please keep this window focused to continue viewing content.
                            Background playback and screen recording are prohibited.
                        </p>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
