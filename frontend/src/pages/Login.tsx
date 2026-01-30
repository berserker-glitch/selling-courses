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