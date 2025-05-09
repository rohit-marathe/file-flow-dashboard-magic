
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileItem } from "@/types/server";
import { toast } from "sonner";
import { updatePermissions } from "@/services/fileService";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem;
  ip: string;
  pemFile?: File;
  onSuccess: () => void;
}

const PermissionsModal = ({
  isOpen,
  onClose,
  item,
  ip,
  pemFile,
  onSuccess,
}: PermissionsModalProps) => {
  const defaultPermissions = item.permissions || {
    read: true,
    write: true,
    execute: item.type === 'directory',
    owner: "root",
    group: "root",
  };

  const [permissions, setPermissions] = useState(defaultPermissions);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updatePermissions(ip, item.path, permissions, pemFile);
      toast.success("Permissions updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>File Permissions: {item.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              value={permissions.owner}
              onChange={(e) =>
                setPermissions({ ...permissions, owner: e.target.value })
              }
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="group">Group</Label>
            <Input
              id="group"
              value={permissions.group}
              onChange={(e) =>
                setPermissions({ ...permissions, group: e.target.value })
              }
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label>Permissions</Label>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="read"
                  checked={permissions.read}
                  onCheckedChange={(checked) =>
                    setPermissions({
                      ...permissions,
                      read: checked === true,
                    })
                  }
                />
                <Label htmlFor="read">Read</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="write"
                  checked={permissions.write}
                  onCheckedChange={(checked) =>
                    setPermissions({
                      ...permissions,
                      write: checked === true,
                    })
                  }
                />
                <Label htmlFor="write">Write</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="execute"
                  checked={permissions.execute}
                  onCheckedChange={(checked) =>
                    setPermissions({
                      ...permissions,
                      execute: checked === true,
                    })
                  }
                />
                <Label htmlFor="execute">Execute</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsModal;
