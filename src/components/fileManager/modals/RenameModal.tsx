
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
import { renameItem } from "@/services/fileService";
import { FileItem } from "@/types/server";
import { toast } from "sonner";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem;
  currentPath: string;
  ip: string;
  pemFile?: File;
  onSuccess: () => void;
}

const RenameModal = ({
  isOpen,
  onClose,
  item,
  currentPath,
  ip,
  pemFile,
  onSuccess,
}: RenameModalProps) => {
  const [newName, setNewName] = useState(item?.name || "");
  const [isRenaming, setIsRenaming] = useState(false);

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error(`${item?.type === 'directory' ? 'Folder' : 'File'} name cannot be empty`);
      return;
    }

    if (newName === item?.name) {
      toast.error("New name cannot be the same as the current name");
      return;
    }

    setIsRenaming(true);
    try {
      await renameItem(ip, currentPath, item.name, newName, pemFile);
      toast.success(`${item?.type === 'directory' ? 'Folder' : 'File'} renamed successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(`Failed to rename ${item?.type === 'directory' ? 'folder' : 'file'}. Please try again.`);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Rename {item?.type === "directory" ? "Folder" : "File"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming}>
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;
