"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";

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
                <Button size="sm" className="gap-2">
                    <IconPlus className="w-4 h-4" />
                    Add New
                </Button>
            </div>
        </header>
    );
}
