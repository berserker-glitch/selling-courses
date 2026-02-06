"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role === "STUDENT") {
                router.push("/student");
            } else {
                setAuthorized(true);
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    if (!authorized) {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex h-screen w-full bg-background font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-background ml-64">
                {children}
            </div>
        </div>
    );
}
