import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export const SecurityOverlay = () => {
    const [isObscured, setIsObscured] = useState(false);
    const [reason, setReason] = useState<string>('');

    useEffect(() => {
        // 1. Tab Visibility (Switching Tabs)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsObscured(true);
                setReason('Content hidden while tab is inactive');
            } else {
                // Optional: require click to resume or auto-resume?
                setIsObscured(false);
            }
        };

        // 2. Window Focus (Clicking away / Alt-Tab)
        const handleBlur = () => {
            setIsObscured(true);
            setReason('Screen capture disabled. Please keep the window in focus.');
        };

        const handleFocus = () => {
            setIsObscured(false);
        };

        // 3. DevTools Detection (Resize Heuristic)
        const handleResize = () => {
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            if (widthDiff > threshold || heightDiff > threshold) {
                setIsObscured(true);
                setReason('DevTools detected. Please close inspector tools to continue.');
            } else {
                // Only clear if we are currently obscured by devtools reasoning? 
                // Creating a state machine might be better, but simpler logic triggers "obscured" state easily.
                if (document.hasFocus()) setIsObscured(false);
            }
        };

        // 4. Prevent Print Screen / Screenshots (Best Effort)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p') || (e.metaKey && e.shiftKey && e.key === '4')) {
                e.preventDefault();
                setIsObscured(true);
                setReason('Screenshots are disabled on this platform.');
                setTimeout(() => setIsObscured(false), 2000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);

        // Initial check
        if (document.hidden || !document.hasFocus()) {
            setIsObscured(true);
            setReason('Please focus the window to view content.');
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!isObscured) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center gap-6 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="rounded-full bg-red-500/10 p-6">
                    <AlertTriangle className="h-16 w-16 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Security Protocol Active</h2>
                <p className="max-w-md text-lg text-gray-400">{reason}</p>
                <div className="mt-8 text-sm text-gray-600">
                    Protected by Scolink Anti-Piracy System
                </div>
            </div>
        </div>
    );
};
