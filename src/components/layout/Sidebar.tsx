
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Files
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
          SSH File Manager
        </h2>
        <div className="space-y-1">
          <SidebarItem 
            icon={Files} 
            label="File Manager" 
            href="/dashboard/file-manager"
            active={activePath.includes('/dashboard/file-manager')} 
          />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
