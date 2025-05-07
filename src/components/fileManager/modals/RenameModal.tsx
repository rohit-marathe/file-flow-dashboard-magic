
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
import { renameItem } from "@/services/fileService";
import { FileItem } from "@/types/server";
import { useToast } from "@/hooks/use-toast";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem;
  currentPath: string;
  ip: string;
  pemFile: File;
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
  const [newName, setNewName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  const handleRename = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newName === item.name) {
      onClose();
      return;
    }

    setIsRenaming(true);
    try {
      await renameItem(ip, currentPath, item.name, newName, pemFile);
      toast({
        title: "Success",
        description: `Successfully renamed "${item.name}" to "${newName}"`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename {item?.type === "directory" ? "Folder" : "File"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newName" className="text-right">
              New Name
            </Label>
            <Input
              id="newName"
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
