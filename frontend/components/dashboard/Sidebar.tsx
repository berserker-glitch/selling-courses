"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    IconSettings,
    IconBook,
    IconUsers,
    IconPuzzle,
    IconLogout,
    IconSchool,
    IconLayoutDashboard
} from "@tabler/icons-react";
import { api } from "@/lib/api";

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

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
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <aside className="w-64 border-r border-border bg-background flex flex-col shadow-none h-screen fixed left-0 top-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                    <div className="bg-primary/20 p-1.5 rounded-md text-primary">
                        <IconSchool className="w-5 h-5" />
                    </div>
                    <span>LMS Admin</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <SidebarItem icon={<IconLayoutDashboard className="w-5 h-5" />} label="Dashboard" href="/" />

                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Manage
                </div>
                <SidebarItem icon={<IconBook className="w-5 h-5" />} label="Courses" href="/courses" />
                <SidebarItem icon={<IconUsers className="w-5 h-5" />} label="Students" href="/students" />
                <SidebarItem icon={<IconPuzzle className="w-5 h-5" />} label="Quizzes" href="/quizzes" />

                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    System
                </div>
                <SidebarItem icon={<IconSettings className="w-5 h-5" />} label="Settings" href="/settings" />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <SidebarItem
                    icon={<IconLogout className="w-5 h-5" />}
                    label="Sign Out"
                    onClick={handleLogout}
                />
            </div>
        </aside>
    );
}
