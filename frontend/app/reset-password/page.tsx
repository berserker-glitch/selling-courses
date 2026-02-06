"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IconLoader2, IconCheck } from "@tabler/icons-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("http://localhost:3000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000); // Redirect after 3 seconds
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <CardContent>
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                    Invalid or missing reset link. Please request a new one.
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/forgot-password">Request Reset Link</Link>
                </Button>
            </CardContent>
        )
    }

    if (success) {
        return (
            <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                    <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                        <IconCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">Password Reset</h3>
                        <p className="text-muted-foreground text-sm">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
                    </div>
                    <Button asChild className="w-full mt-4">
                        <Link href="/login">Return to sign in</Link>
                    </Button>
                </div>
            </CardContent>
        )
    }

    return (
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                        {error}
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        minLength={6}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        minLength={6}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                            Resetting...
                        </>
                    ) : (
                        "Reset Password"
                    )}
                </Button>
            </form>
        </CardContent>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md shadow-lg border-muted">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Reset Password
                    </CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <Suspense fallback={<CardContent><div className="flex justify-center p-4"><IconLoader2 className="animate-spin" /></div></CardContent>}>
                    <ResetPasswordForm />
                </Suspense>
            </Card>
        </div>
    );
}
