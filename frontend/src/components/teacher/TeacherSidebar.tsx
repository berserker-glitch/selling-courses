import { User, LogOut, BookOpen, Users, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'categories', label: 'Categories', icon: Folder },
  ];


  return (
    <div className="sticky top-0 flex h-screen w-72 flex-col border-r bg-sidebar px-4 py-6">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm">
        <BookOpen className="h-6 w-6" />
        <div className="text-lg font-bold tracking-wide uppercase">Teacher Hub</div>
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
              className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-150 ${isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>


      {/* User Profile */}
      <div className="mt-6 space-y-3 border-t pt-4">
        <div className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-bold text-foreground">{user.name}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase">{user.role}</div>
          </div>
        </div>

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
