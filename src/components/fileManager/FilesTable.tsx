
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText, Folder } from "lucide-react";
import { FileItem } from "@/types/server";
import { formatBytes } from "@/lib/formatters";

interface FilesTableProps {
  files: FileItem[];
  loading: boolean;
  onItemDoubleClick: (item: FileItem) => void;
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onEdit: (item: FileItem) => void;
}

const FilesTable = ({
  files,
  loading,
  onItemDoubleClick,
  onRename,
  onDelete,
  onEdit,
}: FilesTableProps) => {
  const isEditable = (filename: string) => {
    const editableExtensions = ['.txt', '.html', '.css', '.js', '.php', '.json', '.md', '.xml'];
    return editableExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead className="w-[15%]">Size</TableHead>
            <TableHead className="w-[20%]">Modified</TableHead>
            <TableHead className="w-[25%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Loading files...
              </TableCell>
            </TableRow>
          ) : files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
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
                <TableCell className="text-right space-x-2">
                  {file.type !== 'directory' && isEditable(file.name) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(file);
                      }}
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
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Rename</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
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
