'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessionStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Shield, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network delay for "premium feel"
        setTimeout(() => {
            try {
                const success = sessionStore.login(username, role);
                if (success) {
                    toast.success(`Welcome back, ${username.toUpperCase()}`, {
                        description: 'Secure session established. Watermarking active.',
                    });
                    router.push(role === 'ADMIN' ? '/admin' : '/dashboard');
                } else {
                    toast.error('Access Denied', {
                        description: 'Invalid credentials or unauthorized device.',
                    });
                }
            } catch (err: any) {
                toast.error('Login Failed', { description: err.message });
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm dark:bg-black/80" />

            <div className="relative w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8 space-y-2 animate-float">
                    <div className="w-16 h-16 bg-primary mx-auto rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/50 text-white">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        Mohibi Maths
                    </h1>
                    <p className="text-muted-foreground text-sm">Secure Learning Environment</p>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 border-t border-white/20 relative overflow-hidden">
                    {/* Top light effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-primary/50 blur-lg" />

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Role Tabs */}
                        <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setRole('STUDENT')}
                                className={cn(
                                    "flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                                    role === 'STUDENT'
                                        ? "bg-background shadow-lg text-primary scale-[1.02]"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <User className="w-4 h-4" />
                                <span>Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ADMIN')}
                                className={cn(
                                    "flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                                    role === 'ADMIN'
                                        ? "bg-background shadow-lg text-destructive scale-[1.02]"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Lock className="w-4 h-4" />
                                <span>Admin</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono placeholder:text-muted-foreground/50"
                                    placeholder={role === 'ADMIN' ? 'admin' : 'MM-2024-XXX'}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono placeholder:text-muted-foreground/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                role === 'ADMIN'
                                    ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                                    : "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40"
                            )}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Initialize Session</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-muted-foreground/50 max-w-[200px] mx-auto leading-tight">
                            By logging in, you agree to forensic watermarking and device fingerprinting.
                            <br />IP: 127.0.0.1 (Logged)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
