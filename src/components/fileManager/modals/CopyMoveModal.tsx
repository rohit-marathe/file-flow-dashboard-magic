
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copyItem, moveItem, listFiles } from "@/services/fileService";
import { FileItem } from "@/types/server";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CopyMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem;
  currentPath: string;
  ip: string;
  pemFile?: File;
  onSuccess: () => void;
  mode: 'copy' | 'move';
}

const CopyMoveModal = ({
  isOpen,
  onClose,
  item,
  currentPath,
  ip,
  pemFile,
  onSuccess,
  mode,
}: CopyMoveModalProps) => {
  const [destinationPath, setDestinationPath] = useState(currentPath);
  const [availablePaths, setAvailablePaths] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailablePaths();
    }
  }, [isOpen]);

  const fetchAvailablePaths = async () => {
    setIsLoading(true);
    try {
      // For simplicity, we'll just show some common paths
      // In a real implementation, this would fetch available directories from the server
      setAvailablePaths([
        "/var/www/",
        "/var/www/html/",
        "/var/www/html/wp.zyntr.com/",
        "/var/www/cgi-bin/"
      ]);
    } catch (error) {
      console.error("Error fetching paths:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!destinationPath) {
      toast.error("Please select a destination path");
      return;
    }

    setIsProcessing(true);
    try {
      if (mode === 'copy') {
        await copyItem(ip, item.path, destinationPath + item.name, pemFile);
        toast.success(`${item.type === 'directory' ? 'Folder' : 'File'} copied successfully`);
      } else {
        await moveItem(ip, item.path, destinationPath + item.name, pemFile);
        toast.success(`${item.type === 'directory' ? 'Folder' : 'File'} moved successfully`);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'copy' ? 'copying' : 'moving'} item:`, error);
      toast.error(`Failed to ${mode} ${item.type === 'directory' ? 'folder' : 'file'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'copy' ? 'Copy' : 'Move'} {item?.type === 'directory' ? 'Folder' : 'File'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Source</Label>
            <Input value={item?.path} readOnly className="mt-1" />
          </div>
          <div>
            <Label htmlFor="destinationPath">Destination</Label>
            <Select
              value={destinationPath}
              onValueChange={setDestinationPath}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select destination path" />
              </SelectTrigger>
              <SelectContent>
                {availablePaths.map((path) => (
                  <SelectItem key={path} value={path}>
                    {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing
              ? mode === 'copy'
                ? 'Copying...'
                : 'Moving...'
              : mode === 'copy'
                ? 'Copy'
                : 'Move'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CopyMoveModal;
