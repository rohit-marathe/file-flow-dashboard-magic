
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronRight, 
  Folder, 
  FileText, 
  Upload, 
  FolderPlus,
  Edit, 
  Trash2, 
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileItem, Site, listFiles, getSites } from '@/services/fileService';
import Breadcrumbs from './Breadcrumbs';
import FilesTable from './FilesTable';
import CreateFolderModal from './modals/CreateFolderModal';
import UploadFileModal from './modals/UploadFileModal';
import EditFileModal from './modals/EditFileModal';
import RenameModal from './modals/RenameModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

const FileManagerComponent = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [currentPath, setCurrentPath] = useState('/var/www/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  
  // Modal states
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);
  const [isEditFileModalOpen, setIsEditFileModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Fetch sites on component mount
    const fetchSites = async () => {
      try {
        const sitesData = await getSites();
        setSites(sitesData);
        if (sitesData.length > 0) {
          setSelectedSite(sitesData[0]);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch sites. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchSites();
  }, []);

  useEffect(() => {
    // Fetch files whenever selectedSite or currentPath changes
    if (selectedSite) {
      fetchFiles();
    }
  }, [selectedSite, currentPath]);

  const fetchFiles = async () => {
    if (!selectedSite) return;

    setLoading(true);
    try {
      const filesData = await listFiles(selectedSite.ip, currentPath);
      setFiles(filesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSiteChange = (value: string) => {
    const site = sites.find((s) => s.domain === value);
    if (site) {
      setSelectedSite(site);
      setCurrentPath('/var/www/');
    }
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'directory') {
      setCurrentPath((prevPath) => {
        if (prevPath.endsWith('/')) {
          return `${prevPath}${item.name}`;
        } else {
          return `${prevPath}/${item.name}`;
        }
      });
    } else {
      // Open file edit modal for text files
      setSelectedItem(item);
      setIsEditFileModalOpen(true);
    }
  };

  const handleRefreshFiles = () => {
    fetchFiles();
  };

  const handleNavigateUp = () => {
    setCurrentPath((prevPath) => {
      const pathParts = prevPath.split('/').filter(Boolean);
      if (pathParts.length <= 2) { // Don't go above /var/www/
        return '/var/www/';
      }
      const newPath = '/' + pathParts.slice(0, -1).join('/') + '/';
      return newPath;
    });
  };

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const handleRename = (item: FileItem) => {
    setSelectedItem(item);
    setIsRenameModalOpen(true);
  };

  const handleDelete = (item: FileItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (item: FileItem) => {
    setSelectedItem(item);
    setIsEditFileModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">File Manager</h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <Select onValueChange={handleSiteChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={selectedSite?.domain || "Select a site"} />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.domain} value={site.domain}>
                    {site.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNavigateUp}
                  disabled={currentPath === '/var/www/'}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Up
                </Button>
                <Breadcrumbs 
                  path={currentPath} 
                  onClick={handleBreadcrumbClick} 
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshFiles}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsCreateFolderModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New Folder
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setIsUploadFileModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>

            <FilesTable
              files={files}
              loading={loading}
              onItemDoubleClick={handleItemDoubleClick}
              onRename={handleRename}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        currentPath={currentPath}
        ip={selectedSite?.ip || ''}
        onSuccess={fetchFiles}
      />

      <UploadFileModal
        isOpen={isUploadFileModalOpen}
        onClose={() => setIsUploadFileModalOpen(false)}
        currentPath={currentPath}
        ip={selectedSite?.ip || ''}
        onSuccess={fetchFiles}
      />

      {selectedItem && (
        <>
          <EditFileModal
            isOpen={isEditFileModalOpen}
            onClose={() => setIsEditFileModalOpen(false)}
            item={selectedItem}
            ip={selectedSite?.ip || ''}
            onSuccess={fetchFiles}
          />

          <RenameModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            item={selectedItem}
            currentPath={currentPath}
            ip={selectedSite?.ip || ''}
            onSuccess={fetchFiles}
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            item={selectedItem}
            ip={selectedSite?.ip || ''}
            onSuccess={fetchFiles}
          />
        </>
      )}
    </div>
  );
};

export default FileManagerComponent;
