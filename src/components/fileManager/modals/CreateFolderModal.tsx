
import { useState } from "react";
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
import { createFolder } from "@/services/fileService";
import { toast } from "sonner";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  ip: string;
  pemFile?: File;
  onSuccess: () => void;
}

const CreateFolderModal = ({
  isOpen,
  onClose,
  currentPath,
  ip,
  pemFile,
  onSuccess,
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      console.log(`Creating folder "${folderName}" at path "${currentPath}"`);
      await createFolder(ip, currentPath, folderName.trim(), pemFile);
      toast.success(`Folder "${folderName}" created successfully`);
      onSuccess(); // This will refresh the file list
      onClose();
      setFolderName("");
    } catch (error) {
      console.error("Folder creation error:", error);
      toast.error("Failed to create folder. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Reset the form when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFolderName("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folderName" className="text-right">
              Folder Name
            </Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="col-span-3"
              autoFocus
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !folderName.trim()}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
