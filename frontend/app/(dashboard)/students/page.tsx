import { Header } from "@/components/dashboard/Header";

export default function StudentsPage() {
    return (
        <>
            <Header />
            <div className="p-8">
                <h2 className="text-2xl font-bold">Students Management</h2>
                <p className="text-muted-foreground mt-2">View and manage your students here.</p>
            </div>
        </>
    );
}
