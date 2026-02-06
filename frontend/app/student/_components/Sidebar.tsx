"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    IconLogout,
    IconSchool,
    IconLayoutDashboard,
    IconUser
} from "@tabler/icons-react";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export function StudentSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<{ name: string } | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {});
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        }
    };

    const SidebarItem = ({ icon, label, href, onClick, active }: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void; active?: boolean }) => {
        const isActive = active || (href && pathname === href);

        return (
            <button
                onClick={onClick ? onClick : () => href && router.push(href)}
                className={cn(
                    "flex items-center w-full gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-primary-foreground/80 hover:bg-white/10 hover:text-white"
                )}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <aside className="w-64 bg-primary text-primary-foreground flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl border-t-0 border-r-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                    <div className="bg-white/10 p-1.5 rounded-md text-white">
                        <IconSchool className="w-5 h-5" />
                    </div>
                    <span>Student Portal</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <SidebarItem icon={<IconLayoutDashboard className="w-5 h-5" />} label="My Courses" href="/student" />
            </nav>

            {/* User & Footer */}
            <div className="p-4 border-t border-white/10">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-md bg-white/10">
                        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <IconUser className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{user.name}</span>
                            <span className="text-xs text-primary-foreground/70">Student</span>
                        </div>
                    </div>
                )}

                <SidebarItem
                    icon={<IconLogout className="w-5 h-5" />}
                    label="Sign Out"
                    onClick={handleLogout}
                />
            </div>
        </aside>
    );
}
