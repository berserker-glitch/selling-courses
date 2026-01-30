'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from '@/lib/mock-db';

interface WatermarkProps {
    user: User;
}

export function Watermark({ user }: WatermarkProps) {
    const [position, setPosition] = useState({ top: '10%', left: '10%' });
    const [opacity, setOpacity] = useState(0.3);

    useEffect(() => {
        // Move watermark every 30-60 seconds
        const moveWatermark = () => {
            const top = Math.floor(Math.random() * 80) + 10; // 10% to 90%
            const left = Math.floor(Math.random() * 80) + 10;
            const newOpacity = 0.2 + Math.random() * 0.3; // Random opacity 0.2 - 0.5

            setPosition({ top: `${top}%`, left: `${left}%` });
            setOpacity(newOpacity);
        };

        const interval = setInterval(moveWatermark, 45000); // 45s average
        moveWatermark(); // Initial move

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className="watermark-overlay fixed z-[9999] pointer-events-none select-none flex flex-col items-center justify-center p-4 rounded-lg mix-blend-difference"
            style={{
                top: position.top,
                left: position.left,
                opacity: opacity,
                transform: 'translate(-50%, -50%) rotate(-15deg)',
                transition: 'all 5s ease-in-out'
            }}
        >
            <div className="text-xl font-bold tracking-widest text-white/50">{user.studentNumber || 'ADMIN'}</div>
            <div className="text-sm font-light text-white/30">{user.username}</div>
            <div className="text-[10px] text-white/20 mt-1">{new Date().toISOString().split('T')[0]}</div>
            <div className="text-[8px] text-white/10">{user.id}</div>
        </div>
    );
}
