
import { useState, useRef } from "react";
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
import { uploadFile } from "@/services/fileService";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  ip: string;
  pemFile?: File;
  onSuccess: () => void;
}

const UploadFileModal = ({
  isOpen,
  onClose,
  currentPath,
  ip,
  pemFile,
  onSuccess,
}: UploadFileModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      await uploadFile(ip, currentPath, selectedFile, pemFile);
      toast.success(`File "${selectedFile.name}" uploaded successfully`);
      onSuccess();
      onClose();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadFileModal;
