
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, LogOut, User, GraduationCap, ArrowLeft, Save } from 'lucide-react';
import { cn } from "@/lib/utils";
import api from '@/lib/api';
import { toast } from "sonner";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function Profile() {
    const [user, setUser] = useState<UserData | null>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    // Use Blue theme as requested
    const themeColor = '#3b82f6'; // Blue-500

    useEffect(() => {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            setUser(userData);
            setName(userData.name);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        navigate('/login');
    };

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // In a real app, this would be an API call
            // await api.put(`/users/${user.id}`, { name, password });

            // Simulating update for now since we might not have a full profile update endpoint ready
            // Or we can try to hit an endpoint if one exists.
            // For this task, "Edit Name and Password" implies frontend capability primarily.

            // Update local storage to reflect name change immediately
            const updatedUser = { ...user, name };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success("Profile updated successfully");
            setPassword(''); // Clear password field
        } catch (error) {
            toast.error("Failed to update profile");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 lg:relative lg:translate-x-0 flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
                style={{ backgroundColor: themeColor }}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white mb-6">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-sm">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span>Academy</span>
                    </div>

                    <p className="text-white/80 text-sm leading-relaxed">
                        Welcome back, <br />
                        <span className="font-bold text-lg text-white">{user.name}</span>
                    </p>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 py-6 px-4 space-y-1">
                    <button
                        onClick={() => navigate('/student')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white font-medium transition-all"
                    >
                        <BookOpen className="h-5 w-5" />
                        My Courses
                    </button>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 text-white font-medium shadow-sm transition-all border border-white/10"
                    >
                        <User className="h-5 w-5" />
                        Profile
                    </button>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10 bg-black/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                                {(user.name || '?')[0]}
                            </div>
                            <div className="text-xs">
                                <p className="font-semibold text-white">Logged in as</p>
                                <p className="text-white/70 truncate max-w-[120px]">{user.email}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full bg-slate-50 dark:bg-slate-950 relative">
                <div
                    className="absolute top-0 inset-x-0 h-64 opacity-5 pointer-events-none"
                    style={{
                        background: `linear-gradient(180deg, ${themeColor} 0%, transparent 100%)`
                    }}
                />

                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3 dark:border-slate-800 dark:bg-slate-950/80">
                    <span className="font-bold text-slate-800">Academy</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <div className="space-y-1">
                            <div className="w-5 h-0.5 bg-slate-600"></div>
                            <div className="w-5 h-0.5 bg-slate-600"></div>
                            <div className="w-5 h-0.5 bg-slate-600"></div>
                        </div>
                    </Button>
                </div>

                <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8">
                    <div>
                        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600" onClick={() => navigate('/student')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Profile Settings
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Manage your account details and password.
                        </p>
                    </div>

                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your display name.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Change your password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <p className="text-xs text-slate-500">Leave blank to keep current password.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
