
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteItem } from "@/services/fileService";
import { FileItem } from "@/types/server";
import { toast } from "sonner";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem;
  ip: string;
  pemFile?: File;
  onSuccess: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  item,
  ip,
  pemFile,
  onSuccess,
}: DeleteConfirmModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    
    setIsDeleting(true);
    try {
      console.log(`Deleting ${item.type}: ${item.path}`);
      await deleteItem(ip, item.path, pemFile);
      toast.success(`${item.type === 'directory' ? 'Folder' : 'File'} "${item.name}" deleted successfully`);
      onSuccess(); // This will refresh the file list
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete ${item.type === 'directory' ? 'folder' : 'file'}. Please try again.`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {item?.type === "directory" ? "folder" : "file"}{" "}
            <span className="font-medium text-foreground">"{item?.name}"</span>?
            {item?.type === "directory" && (
              <div className="mt-2 text-destructive">
                Warning: This will delete all content inside this folder as well.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;
