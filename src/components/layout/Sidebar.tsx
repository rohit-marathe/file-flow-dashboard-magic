
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Files, 
  Settings, 
  Users, 
  Database,
  Server
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, active }: SidebarItemProps) => {
  return (
    <Link 
      to={href} 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
};

export interface SidebarProps {
  className?: string;
  activePath?: string;
}

export function Sidebar({ className, activePath = '/' }: SidebarProps) {
  return (
    <div className={cn("pb-12 w-64 border-r", className)}>
      <div className="px-3 py-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Dashboard
        </h2>
        <div className="space-y-1">
          <SidebarItem 
            icon={Home} 
            label="Home" 
            href="/"
            active={activePath === '/'} 
          />
          <SidebarItem 
            icon={Files} 
            label="File Manager" 
            href="/dashboard/file-manager"
            active={activePath.includes('/dashboard/file-manager')} 
          />
          <SidebarItem 
            icon={Server} 
            label="Instances" 
            href="/dashboard/instances"
            active={activePath.includes('/dashboard/instances')} 
          />
          <SidebarItem 
            icon={Database} 
            label="Databases" 
            href="/dashboard/databases"
            active={activePath.includes('/dashboard/databases')} 
          />
          <SidebarItem 
            icon={Users} 
            label="Users" 
            href="/dashboard/users"
            active={activePath.includes('/dashboard/users')} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            href="/dashboard/settings"
            active={activePath.includes('/dashboard/settings')} 
          />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
