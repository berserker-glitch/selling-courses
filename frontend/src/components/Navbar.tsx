import { User, LogOut, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Student Learning Hub</p>
            <span className="text-xl font-bold tracking-tight text-foreground">Command Bar</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border bg-card px-4 py-1.5 shadow-sm sm:flex">
              <span className="text-lg">{user.avatar}</span>
              <div className="text-left">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-[0.6rem] font-medium text-muted-foreground uppercase">{user.role}</div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}