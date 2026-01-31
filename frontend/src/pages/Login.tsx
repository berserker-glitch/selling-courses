import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

import api from '@/lib/api';
import { useToast } from "@/hooks/use-toast"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', email, 'to', '/auth/login');
      const { data } = await api.post('/auth/login', { email, password });
      console.log('Login success:', data);

      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      })

      // Navigate based on role
      if (data.user.role === 'TEACHER' || data.user.role === 'ADMIN') {
        navigate('/teacher');
      } else {
        navigate('/student'); // Verify this route exists
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Response data:', error.response?.data);

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || 'Could not connect to server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Left Panel - Visual/Brand */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba')] bg-cover bg-center opacity-20 hover:scale-105 transition-transform duration-[20s]" />
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
            "Education is the most powerful weapon which you can use to change the world."
          </blockquote>
          <footer className="text-sm font-medium text-slate-300 uppercase tracking-widest">
            Nelson Mandela
          </footer>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
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

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>



        </div>
      </div>
    </div>
  );
}