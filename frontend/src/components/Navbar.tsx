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
    <nav className="sticky top-0 z-50 w-full border-b-[3px] border-foreground bg-background shadow-neo">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground shadow-neo-xs">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-foreground/60">Student Learning Hub</p>
            <span className="text-2xl font-black uppercase tracking-tight text-foreground">Command Bar</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-none border-[3px] border-foreground bg-card px-4 py-2 text-sm font-semibold uppercase text-foreground shadow-neo-xs sm:flex">
              <span className="text-lg">{user.avatar}</span>
              <div className="text-left">
                <div>{user.name}</div>
                <div className="text-[0.6rem] font-semibold uppercase text-foreground/60">{user.role}</div>
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