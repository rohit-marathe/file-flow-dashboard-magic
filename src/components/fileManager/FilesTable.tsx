
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Folder, Copy, Move, Lock } from "lucide-react";
import { FileItem } from "@/types/server";
import { formatBytes } from "@/lib/formatters";

interface FilesTableProps {
  files: FileItem[];
  loading: boolean;
  onItemDoubleClick: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onEdit: (item: FileItem) => void;
  onPermissions: (item: FileItem) => void;
  onCopy: (item: FileItem) => void;
  onMove: (item: FileItem) => void;
}

const FilesTable = ({
  files,
  loading,
  onItemDoubleClick,
  onRename,
  onDelete,
  onEdit,
  onPermissions,
  onCopy,
  onMove,
}: FilesTableProps) => {
  const isEditable = (filename: string) => {
    const editableExtensions = ['.txt', '.html', '.css', '.js', '.php', '.json', '.md', '.xml'];
    return editableExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Function to render permission indicators
  const renderPermissions = (permissions?: { read: boolean; write: boolean; execute: boolean }) => {
    if (!permissions) return "---";
    
    return `${permissions.read ? 'r' : '-'}${permissions.write ? 'w' : '-'}${permissions.execute ? 'x' : '-'}`;
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Name</TableHead>
            <TableHead className="w-[10%]">Size</TableHead>
            <TableHead className="w-[15%]">Modified</TableHead>
            <TableHead className="w-[10%]">Permissions</TableHead>
            <TableHead className="w-[35%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading files...
              </TableCell>
            </TableRow>
          ) : files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No files found in this directory.
              </TableCell>
            </TableRow>
          ) : (
            files.map((file) => (
              <TableRow 
                key={file.name}
                className="hover:bg-muted/50 cursor-pointer"
                onDoubleClick={() => onItemDoubleClick(file)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {file.type === 'directory' ? (
                      <Folder className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    {file.name}
                  </div>
                </TableCell>
                <TableCell>
                  {file.type === 'directory' ? '—' : formatBytes(file.size)}
                </TableCell>
                <TableCell>
                  {new Date(file.modified).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono">
                  {renderPermissions(file.permissions)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {file.type !== 'directory' && isEditable(file.name) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(file);
                        }}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(file);
                      }}
                      title="Rename"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Rename</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPermissions(file);
                      }}
                      title="Permissions"
                    >
                      <Lock className="h-4 w-4" />
                      <span className="sr-only">Permissions</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(file);
                      }}
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(file);
                      }}
                      title="Move"
                    >
                      <Move className="h-4 w-4" />
                      <span className="sr-only">Move</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FilesTable;
