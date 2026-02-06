import { Header } from "@/components/dashboard/Header";
import { CourseCreationModal } from "@/components/dashboard/CourseCreationModal";
import { CourseList } from "@/components/dashboard/CourseList";

export default function CoursesPage() {
    return (
        <>
            <Header />
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Courses Management</h2>
                        <p className="text-muted-foreground mt-2">Manage your courses here.</p>
                    </div>
                    <CourseCreationModal />
                </div>

                <CourseList />
            </div>
        </>
    );
}
