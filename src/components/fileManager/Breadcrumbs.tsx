
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  path: string;
  onClick: (path: string) => void;
}

const Breadcrumbs = ({ path, onClick }: BreadcrumbsProps) => {
  // Split the path and create breadcrumb items
  const getParts = () => {
    const parts = path.split('/').filter(p => p);
    const breadcrumbs = [];
    
    // Add root
    breadcrumbs.push({
      name: 'var',
      path: '/var/'
    });
    
    // Add intermediate paths
    let currentPath = '/var/';
    for (let i = 1; i < parts.length; i++) {
      currentPath += parts[i] + '/';
      breadcrumbs.push({
        name: parts[i],
        path: currentPath
      });
    }
    
    return breadcrumbs;
  };

  const parts = getParts();

  return (
    <div className="flex items-center flex-wrap text-sm text-gray-500">
      {parts.map((part, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          <button
            onClick={() => onClick(part.path)}
            className="hover:text-primary hover:underline transition-colors"
          >
            {part.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
