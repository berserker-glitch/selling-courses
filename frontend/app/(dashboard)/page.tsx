"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconSchool } from "@tabler/icons-react";


export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto border border-border border-dashed">
                        <IconSchool className="w-10 h-10 text-muted-foreground/50" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">No courses created</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            There are no courses currently. Create your first course to get started with your teaching journey!
                        </p>
                    </div>

                    <Button className="shadow-none rounded-full px-8 font-semibold" size="lg">
                        + Create Course
                    </Button>
                </div>
            </div>
        </>
    );
}
