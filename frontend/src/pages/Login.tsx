import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication - check if user exists
    const user = mockUsers.find(u => u.email === email);

    if (user) {
      // Store user in localStorage (mock session)
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Navigate based on role
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } else {
      alert('Invalid credentials. Try: sarah@teacher.com (teacher) or alex@student.com (student)');
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 text-slate-900 dark:bg-slate-950 dark:text-slate-50 selection:bg-sky-500/30">

      {/* Aurora Background - Sky/Blue Theme */}
      <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <Card className="w-full max-w-md border-white/20 bg-white/60 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
        <CardContent className="space-y-8 p-10">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl shadow-sky-900/10 dark:bg-white dark:text-slate-900">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-sky-500 focus:ring-sky-500 dark:border-slate-800 dark:bg-slate-950/50 transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </Label>
                <a href="#" className="text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-slate-200 bg-white/50 backdrop-blur-sm focus:border-sky-500 focus:ring-sky-500 dark:border-slate-800 dark:bg-slate-950/50 transition-all duration-200"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-sky-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all duration-300 group"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 text-center dark:border-slate-800/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail('sarah@teacher.com'); setPassword('password'); }}
                className="flex w-full items-center justify-between rounded-lg bg-white p-2 px-3 text-xs font-medium text-slate-600 shadow-sm border border-slate-100 hover:border-sky-200 hover:text-sky-600 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <span>Teacher</span>
                <span className="font-mono opacity-70">sarah@teacher.com</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('alex@student.com'); setPassword('password'); }}
                className="flex w-full items-center justify-between rounded-lg bg-white p-2 px-3 text-xs font-medium text-slate-600 shadow-sm border border-slate-100 hover:border-sky-200 hover:text-sky-600 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <span>Student</span>
                <span className="font-mono opacity-70">alex@student.com</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLoading, setIsLoading] = useState(false);
const navigate = useNavigate();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  // Simulate login delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock authentication - check if user exists
  const user = mockUsers.find(u => u.email === email);

  if (user) {
    // Store user in localStorage (mock session)
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Navigate based on role
    if (user.role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  } else {
    alert('Invalid credentials. Try: sarah@teacher.com (teacher) or alex@student.com (student)');
  }

  setIsLoading(false);
};

return (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <Card className="w-full max-w-md shadow-sm">
      <CardContent className="space-y-8 p-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
          <p className="text-xs font-medium text-muted-foreground uppercase">Access your command center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium uppercase">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="sarah@teacher.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium uppercase">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Accounts */}
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase">Demo Access</p>
          <div className="mt-3 space-y-2 text-xs font-bold text-foreground">
            <div className="flex items-center justify-between">
              <span>Teacher</span>
              <span>sarah@teacher.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Student</span>
              <span>alex@student.com</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
}