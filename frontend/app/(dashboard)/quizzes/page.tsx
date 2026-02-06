import { Header } from "@/components/dashboard/Header";

export default function QuizzesPage() {
    return (
        <>
            <Header />
            <div className="p-8">
                <h2 className="text-2xl font-bold">Quizzes</h2>
                <p className="text-muted-foreground mt-2">Manage quiz content here.</p>
            </div>
        </>
    );
}
