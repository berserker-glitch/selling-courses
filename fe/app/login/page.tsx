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
                    <h1 className="heading-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 text-3xl md:text-4xl mb-0">
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
                        <div className="grid grid-cols-2 p-1 bg-muted/50 rounded-xl border border-white/5" role="tablist" aria-label="Login Role Selection">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={role === 'STUDENT'}
                                onClick={() => setRole('STUDENT')}
                                className={cn(
                                    "flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary",
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
                                role="tab"
                                aria-selected={role === 'ADMIN'}
                                onClick={() => setRole('ADMIN')}
                                className={cn(
                                    "flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary",
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
                                <label htmlFor="username" className="label-text">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field font-mono"
                                    placeholder={role === 'ADMIN' ? 'admin' : 'MM-2024-XXX'}
                                    aria-label="Username"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="label-text">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field font-mono"
                                    placeholder="••••••••"
                                    aria-label="Password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                role === 'ADMIN' ? "btn-destructive" : "btn-primary",
                                "w-full"
                            )}
                            aria-label={loading ? "Logging in..." : "Initialize Session"}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Initialize Session</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
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
