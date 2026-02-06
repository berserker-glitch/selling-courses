"use client";

import { StudentSidebar } from "./_components/Sidebar";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background font-sans">
            <StudentSidebar />
            <div className="flex-1 flex flex-col min-w-0 ml-64 bg-muted/10">
                {children}
            </div>
        </div>
    );
}
