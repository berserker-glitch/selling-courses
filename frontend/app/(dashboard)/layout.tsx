import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-background font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-background ml-64">
                {children}
            </div>
        </div>
    );
}
