
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activePath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Hosting Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg shadow p-6 border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">File Manager</h2>
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Manage your website files with an intuitive file manager interface.
                </p>
                <Button asChild className="w-full">
                  <Link to="/dashboard/file-manager">
                    Open File Manager
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
