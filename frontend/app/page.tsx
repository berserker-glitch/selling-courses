"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IconLogout } from "@tabler/icons-react";

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<{ role: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Get user data
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md text-center shadow-lg border-muted">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight text-primary">
                        Welcome, {user?.name || "User"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        You are logged in as: <span className="font-semibold text-foreground capitalize">{user?.role?.toLowerCase()}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        This is a protected dashboard page. Only authenticated users can see this.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full sm:w-auto gap-2"
                    >
                        <IconLogout className="w-4 h-4" />
                        Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}