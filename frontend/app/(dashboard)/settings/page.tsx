import { CategoryManagement } from "@/components/settings/CategoryManagement";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    return (
        <div className="h-full bg-background overflow-auto">
            <div className="p-8 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <p className="text-muted-foreground mt-2">Manage your application settings here.</p>
                </div>

                <Separator />

                <section>
                    <CategoryManagement />
                </section>
            </div>
        </div>
    );
}
