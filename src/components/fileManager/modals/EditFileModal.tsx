
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { readFile, saveFile } from "@/services/fileService";
import { FileItem } from "@/types/server";
import { useToast } from "@/hooks/use-toast";

interface EditFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem;
  ip: string;
  pemFile: File;
  onSuccess: () => void;
}

const EditFileModal = ({
  isOpen,
  onClose,
  item,
  ip,
  pemFile,
  onSuccess,
}: EditFileModalProps) => {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && item) {
      fetchFileContent();
    }
  }, [isOpen, item]);

  const fetchFileContent = async () => {
    setIsLoading(true);
    try {
      const fileContent = await readFile(ip, item.path, pemFile);
      setContent(fileContent);
      setOriginalContent(fileContent);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to read file content",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFile(ip, item.path, content, pemFile);
      toast({
        title: "Success",
        description: `File "${item.name}" saved successfully`,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = content !== originalContent;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit File: {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              Loading file content...
            </div>
          ) : (
            <Textarea
              className="h-full min-h-[60vh] font-mono"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFileModal;
