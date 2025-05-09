
import { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Upload, 
  FolderPlus,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Copy,
  Move,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileItem, ServerConnection } from '@/types/server';
import { listFiles } from '@/services/fileService';
import Breadcrumbs from './Breadcrumbs';
import FilesTable from './FilesTable';
import CreateFolderModal from './modals/CreateFolderModal';
import UploadFileModal from './modals/UploadFileModal';
import EditFileModal from './modals/EditFileModal';
import RenameModal from './modals/RenameModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import PermissionsModal from './modals/PermissionsModal';
import CopyMoveModal from './modals/CopyMoveModal';
import { toast } from 'sonner';

interface FileManagerComponentProps {
  serverConnection: ServerConnection;
  onDisconnect: () => void;
}

const FileManagerComponent = ({ serverConnection, onDisconnect }: FileManagerComponentProps) => {
  const [currentPath, setCurrentPath] = useState(serverConnection.path);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  
  // Modal states
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);
  const [isEditFileModalOpen, setIsEditFileModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCopyMoveModalOpen, setIsCopyMoveModalOpen] = useState(false);
  const [copyMoveMode, setCopyMoveMode] = useState<'copy' | 'move'>('copy');

  useEffect(() => {
    // Fetch files when the component mounts or currentPath changes
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      console.log("Fetching files for:", serverConnection.ip, currentPath);
      const filesData = await listFiles(serverConnection.ip, currentPath, serverConnection.pemFile);
      setFiles(filesData);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to fetch files. Please try again.");
    } finally {
      setLoading(false);
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

  const handlePermissions = (item: FileItem) => {
    setSelectedItem(item);
    setIsPermissionsModalOpen(true);
  };

  const handleCopyMove = (item: FileItem, mode: 'copy' | 'move') => {
    setSelectedItem(item);
    setCopyMoveMode(mode);
    setIsCopyMoveModalOpen(true);
  };

  // This function will be called after successful operations to refresh the file list
  const handleOperationSuccess = async () => {
    await fetchFiles();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">File Manager</h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Server:</span>
                <span className="text-muted-foreground">{serverConnection.ip}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">User:</span>
                <span className="text-muted-foreground">{serverConnection.username}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onDisconnect}>
              <LogOut className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
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
              onPermissions={handlePermissions}
              onCopy={(item) => handleCopyMove(item, 'copy')}
              onMove={(item) => handleCopyMove(item, 'move')}
            />
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        currentPath={currentPath}
        ip={serverConnection.ip}
        pemFile={serverConnection.pemFile}
        onSuccess={handleOperationSuccess}
      />

      <UploadFileModal
        isOpen={isUploadFileModalOpen}
        onClose={() => setIsUploadFileModalOpen(false)}
        currentPath={currentPath}
        ip={serverConnection.ip}
        pemFile={serverConnection.pemFile}
        onSuccess={handleOperationSuccess}
      />

      {selectedItem && (
        <>
          <EditFileModal
            isOpen={isEditFileModalOpen}
            onClose={() => setIsEditFileModalOpen(false)}
            item={selectedItem}
            ip={serverConnection.ip}
            pemFile={serverConnection.pemFile}
            onSuccess={handleOperationSuccess}
          />

          <RenameModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            item={selectedItem}
            currentPath={currentPath}
            ip={serverConnection.ip}
            pemFile={serverConnection.pemFile}
            onSuccess={handleOperationSuccess}
          />

          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            item={selectedItem}
            ip={serverConnection.ip}
            pemFile={serverConnection.pemFile}
            onSuccess={handleOperationSuccess}
          />

          <PermissionsModal
            isOpen={isPermissionsModalOpen}
            onClose={() => setIsPermissionsModalOpen(false)}
            item={selectedItem}
            ip={serverConnection.ip}
            pemFile={serverConnection.pemFile}
            onSuccess={handleOperationSuccess}
          />

          <CopyMoveModal
            isOpen={isCopyMoveModalOpen}
            onClose={() => setIsCopyMoveModalOpen(false)}
            item={selectedItem}
            currentPath={currentPath}
            ip={serverConnection.ip}
            pemFile={serverConnection.pemFile}
            onSuccess={handleOperationSuccess}
            mode={copyMoveMode}
          />
        </>
      )}
    </div>
  );
};

export default FileManagerComponent;
