"use client";

import { useEffect, useState } from "react";

export function Header() {
    const [user, setUser] = useState<{ role: string; name: string } | null>(null);

    useEffect(() => {
        // Get user data
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background shadow-none sticky top-0 z-10">
            <div className="space-y-0.5">
                <h1 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    Hey, {user?.name || "Administrator"} <span className="text-2xl animate-pulse">👋</span>
                </h1>
                <p className="text-muted-foreground text-xs font-medium">
                    {user?.role === "INSTRUCTOR" ? "Manage your courses and students" : "Manage your learning journey"}
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Role Toggle */}
                <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border">
                    <button className="px-3 py-1 text-sm font-semibold rounded-md bg-background shadow-none border border-border text-foreground">
                        Instructor
                    </button>
                    <button className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Student
                    </button>
                </div>
            </div>
        </header>
    );
}
