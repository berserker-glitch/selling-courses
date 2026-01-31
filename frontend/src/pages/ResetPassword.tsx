
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from "sonner";

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!token) {
            toast.error("Invalid token");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', { token, password });
            toast.success("Password reset successfully");
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-red-600">Invalid Link</h1>
                    <p className="text-slate-500">This password reset link is invalid or expired.</p>
                    <Button onClick={() => navigate('/login')} className="mt-4">Back to Login</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
            {/* Left Panel - Visual/Brand */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span>Academy</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg space-y-6">
                    <blockquote className="text-3xl font-medium leading-normal">
                        "Secure your future. One step at a time."
                    </blockquote>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
                <div className="w-full max-w-[400px] space-y-8">
                    <div className="text-center space-y-2">
                        <div className="bg-blue-50 dark:bg-blue-900/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Set New Password
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Must be at least 6 characters long.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>

                </div>
            </div>
        </div>
    );
}
