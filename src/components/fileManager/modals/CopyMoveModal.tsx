
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
  const [customPath, setCustomPath] = useState("");
  const [useCustomPath, setUseCustomPath] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDestinationPath(currentPath);
      fetchAvailablePaths();
    }
  }, [isOpen, currentPath]);

  const fetchAvailablePaths = async () => {
    setIsLoading(true);
    try {
      // Get root directories
      const rootPaths = [
        "/var/www/",
        "/var/www/html/",
        "/home/",
        "/etc/",
        currentPath
      ];
      
      setAvailablePaths([...new Set(rootPaths)]);
      
      // If we have a PEM file, try to fetch actual directories
      if (pemFile && ip) {
        try {
          const files = await listFiles(ip, "/var/www/", pemFile);
          const directories = files
            .filter(file => file.type === 'directory')
            .map(dir => {
              let path = dir.path;
              if (!path.endsWith('/')) path += '/';
              return path;
            });
          
          // Combine with root paths and remove duplicates
          setAvailablePaths([...new Set([...rootPaths, ...directories])]);
        } catch (error) {
          console.error("Error fetching directories:", error);
          // Fallback to root paths if we can't fetch
        }
      }
    } catch (error) {
      console.error("Error setting up paths:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Determine which path to use
    const finalPath = useCustomPath ? customPath : destinationPath;
    
    if (!finalPath) {
      toast.error("Please select or enter a destination path");
      return;
    }

    // Ensure path ends with a slash
    let path = finalPath;
    if (!path.endsWith('/')) {
      path += '/';
    }

    setIsProcessing(true);
    try {
      if (mode === 'copy') {
        await copyItem(ip, item.path, path + item.name, pemFile);
        toast.success(`${item.type === 'directory' ? 'Folder' : 'File'} copied successfully`);
      } else {
        await moveItem(ip, item.path, path + item.name, pemFile);
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
          
          <div className="space-y-2">
            <Label htmlFor="destinationMethod">Destination</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Button 
                type="button"
                variant={!useCustomPath ? "default" : "outline"}
                size="sm"
                onClick={() => setUseCustomPath(false)}
              >
                Select Path
              </Button>
              <Button 
                type="button"
                variant={useCustomPath ? "default" : "outline"}
                size="sm"
                onClick={() => setUseCustomPath(true)}
              >
                Custom Path
              </Button>
            </div>
            
            {useCustomPath ? (
              <Input
                placeholder="Enter destination path (e.g. /var/www/html/)"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
              />
            ) : (
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
            )}
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
