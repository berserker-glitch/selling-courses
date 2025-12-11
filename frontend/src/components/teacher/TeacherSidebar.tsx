import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Home } from 'lucide-react';

interface TeacherSidebarProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function TeacherSidebar({ user, activeSection, onSectionChange, onLogout }: TeacherSidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
  ];


  return (
    <div className="sticky top-0 flex h-screen w-72 flex-col border-r-[3px] border-foreground bg-sidebar px-4 py-6 shadow-neo">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 rounded-none border-[3px] border-foreground bg-primary px-4 py-3 text-primary-foreground shadow-neo-sm">
        <BookOpen className="h-6 w-6" />
        <div className="text-lg font-bold uppercase tracking-wide">Teacher Hub</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-none border-[3px] border-foreground px-4 py-3 text-sm font-semibold uppercase tracking-wide shadow-neo-xs transition-transform duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-sidebar text-sidebar-foreground hover:-translate-y-[2px] hover:-translate-x-[2px]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>


      {/* User Profile */}
      <div className="mt-6 space-y-3 border-t-[3px] border-foreground pt-4">
        <div className="flex items-center gap-3 rounded-none border-[3px] border-foreground bg-card p-3 shadow-neo-xs">
          <div className="flex h-10 w-10 items-center justify-center border-[3px] border-foreground bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-bold uppercase text-foreground">{user.name}</div>
            <div className="text-xs font-semibold uppercase text-foreground/70">{user.role}</div>
          </div>
        </div>

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start border-[3px] border-foreground bg-destructive text-destructive-foreground shadow-neo-xs"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
