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
    IconLayoutDashboard,
    IconMessages
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
        <aside className="w-64 bg-muted/40 flex flex-col h-screen fixed left-0 top-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6">
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
                <SidebarItem icon={<IconMessages className="w-5 h-5" />} label="Messages" href="/messages" />
                <SidebarItem icon={<IconUsers className="w-5 h-5" />} label="Students" href="/students" />
                <div className="relative">
                    <SidebarItem icon={<IconPuzzle className="w-5 h-5" />} label="Quizzes" href="/quizzes" />
                    <span className="absolute top-1/2 -translate-y-1/2 right-2 bg-yellow-500/20 text-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">BETA</span>
                </div>

                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    System
                </div>
                <SidebarItem icon={<IconSettings className="w-5 h-5" />} label="Settings" href="/settings" />
            </nav>

            {/* Footer */}
            <div className="p-4">
                <SidebarItem
                    icon={<IconLogout className="w-5 h-5" />}
                    label="Sign Out"
                    onClick={handleLogout}
                />
            </div>
        </aside>
    );
}
