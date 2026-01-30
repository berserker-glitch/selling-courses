'use client';

import { useEffect, useState } from 'react';
import { sessionStore } from '@/lib/store';
import { db, User } from '@/lib/mock-db';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { Users, AlertTriangle, Activity, Database, UserPlus, Ban } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const currentUser = sessionStore.getUser();

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            router.push('/login');
            return;
        }
        setUsers(db.users.all());
        setLogs(db.logs.all());
    }, [currentUser, router]);

    const toggleBan = (userId: string) => {
        const user = db.users.findUnique({ id: userId });
        if (user) {
            db.users.update(userId, { isBanned: !user.isBanned });
            setUsers([...db.users.all()]);
            toast.success(`User ${user.username} has been ${!user.isBanned ? 'banned' : 'unbanned'}.`);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <DashboardNavbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="heading-xl text-3xl md:text-5xl mb-2 bg-gradient-to-r from-destructive to-red-600">Admin Control Center</h1>
                        <p className="text-muted-foreground text-lg">Monitor security and manage student access.</p>
                    </div>
                    <button className="btn-primary flex items-center space-x-2">
                        <UserPlus className="w-4 h-4" />
                        <span>Create Student</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <section aria-label="Statistics" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Users} label="Total Students" value={users.filter(u => u.role === 'STUDENT').length} color="text-blue-500" />
                    <StatCard icon={Activity} label="Active Sessions" value={logs.filter(l => l.action === 'LOGIN').length} color="text-green-500" />
                    <StatCard icon={AlertTriangle} label="Security Flags" value={logs.filter(l => l.action.includes('VIOLATION')).length} color="text-yellow-500" />
                    <StatCard icon={Ban} label="Banned Users" value={users.filter(u => u.isBanned).length} color="text-red-500" />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Management */}
                    <section aria-label="User Management" className="lg:col-span-2 glass-card border border-border/50 bg-card p-6">
                        <h2 className="heading-lg text-xl flex items-center">
                            <Database className="w-5 h-5 mr-2" />
                            User Database
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="pb-3 px-2">Student ID</th>
                                        <th className="pb-3 px-2">Username</th>
                                        <th className="pb-3 px-2">Status</th>
                                        <th className="pb-3 px-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {users.filter(u => u.role === 'STUDENT').map(user => (
                                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-2 font-mono">{user.studentNumber}</td>
                                            <td className="py-3 px-2">
                                                <div className="font-medium">{user.username}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </td>
                                            <td className="py-3 px-2">
                                                {user.isBanned ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                                                        BANNED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2">
                                                <button
                                                    onClick={() => toggleBan(user.id)}
                                                    className={`btn px-3 py-1 text-xs h-auto min-h-0 ${user.isBanned ? 'btn-ghost text-green-500 hover:text-green-600' : 'btn-ghost text-destructive hover:text-destructive'}`}
                                                    aria-label={user.isBanned ? `Unban ${user.username}` : `Ban ${user.username}`}
                                                >
                                                    {user.isBanned ? 'UNBAN' : 'BAN'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Activity Log */}
                    <section aria-label="Activity Log" className="glass-card border border-border/50 bg-card p-6">
                        <h2 className="heading-lg text-xl flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Live Audit Log
                        </h2>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" role="log">
                            {logs.map((log, i) => (
                                <div key={i} className="flex flex-col p-3 rounded-lg bg-muted/30 border border-border/50 text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-bold ${log.action.includes('VIOLATION') ? 'text-red-500' : 'text-primary'}`}>{log.action}</span>
                                        <span className="text-muted-foreground text-[10px]">{log.timestamp.split('T')[1].split('.')[0]}</span>
                                    </div>
                                    <div className="text-muted-foreground truncate">User: {log.userId}</div>
                                    <div className="font-mono text-[10px] text-muted-foreground/70 mt-1 truncate">
                                        {JSON.stringify(log.metadata)}
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">No activity recorded</div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="glass-card p-4 flex items-center space-x-4 border border-border/50 bg-card">
            <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-sm ${color}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
            </div>
        </div>
    );
}
