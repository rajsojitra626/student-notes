import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, FileText, Loader2, Paperclip, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { ExternalBlob } from "../backend";
import type { Note } from "../backend.d";
import { useCreateNote, useUpdateNote } from "../hooks/useQueries";

const CLASS_LEVELS = [
  "All",
  ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `Sem ${i + 1}`),
];

interface NoteFormModalProps {
  open: boolean;
  onClose: () => void;
  editNote?: Note | null;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export function NoteFormModal({ open, onClose, editNote }: NoteFormModalProps) {
  const isEdit = !!editNote;

  const [title, setTitle] = useState(editNote?.title ?? "");
  const [subject, setSubject] = useState(editNote?.subject ?? "");
  const [classLevel, setClassLevel] = useState(editNote?.classLevel ?? "");
  const [description, setDescription] = useState(editNote?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [keepExistingFile, setKeepExistingFile] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const isPending = createNote.isPending || updateNote.isPending;

  const resetForm = useCallback(() => {
    setTitle(editNote?.title ?? "");
    setSubject(editNote?.subject ?? "");
    setClassLevel(editNote?.classLevel ?? "");
    setDescription(editNote?.description ?? "");
    setFile(null);
    setKeepExistingFile(true);
    setUploadProgress(0);
  }, [editNote]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 100MB limit");
      return;
    }
    setFile(selectedFile);
    setKeepExistingFile(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 100MB limit");
        return;
      }
      setFile(droppedFile);
      setKeepExistingFile(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !subject.trim() ||
      !classLevel ||
      classLevel === "All"
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (isEdit && editNote) {
        await updateNote.mutateAsync({
          id: editNote.id,
          title: title.trim(),
          subject: subject.trim(),
          classLevel,
          description: description.trim() || null,
          file,
          keepExistingFile,
          existingBlob: editNote.file as ExternalBlob | undefined,
          onProgress: setUploadProgress,
        });
        toast.success("Note updated successfully!");
      } else {
        await createNote.mutateAsync({
          title: title.trim(),
          subject: subject.trim(),
          classLevel,
          description: description.trim() || null,
          file,
          onProgress: setUploadProgress,
        });
        toast.success("Note uploaded successfully!");
      }
      resetForm();
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEdit ? "Edit Note" : "Upload Note"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your note details below."
              : "Share your notes with fellow students."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="note-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="note-title"
              data-ocid={
                isEdit ? "edit_note.title_input" : "upload.title_input"
              }
              placeholder="e.g., Trigonometry Complete Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="note-subject" className="text-sm font-medium">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="note-subject"
              data-ocid={
                isEdit ? "edit_note.subject_input" : "upload.subject_input"
              }
              placeholder="e.g., Mathematics, Physics, History"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          {/* Class Level */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Class / Semester <span className="text-destructive">*</span>
            </Label>
            <Select
              value={classLevel}
              onValueChange={setClassLevel}
              disabled={isPending}
            >
              <SelectTrigger
                data-ocid={
                  isEdit ? "edit_note.class_select" : "upload.class_select"
                }
              >
                <SelectValue placeholder="Select class or semester" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_LEVELS.filter((c) => c !== "All").map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="note-description" className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="note-description"
              data-ocid={
                isEdit
                  ? "edit_note.description_textarea"
                  : "upload.description_textarea"
              }
              placeholder="Brief description of what these notes cover..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              File{" "}
              <span className="text-muted-foreground text-xs">
                (PDF or Image, max 100MB)
              </span>
            </Label>

            {/* Existing file indicator */}
            {isEdit && editNote?.file && !file && (
              <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg text-sm">
                <Paperclip className="w-4 h-4 text-primary" />
                <span className="text-foreground flex-1">
                  Existing file attached
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setKeepExistingFile(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Drop zone */}
            <label
              data-ocid="upload.dropzone"
              htmlFor="file-input-upload"
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer block
                ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}
                ${isPending ? "pointer-events-none opacity-60" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                id="file-input-upload"
                type="file"
                className="sr-only"
                accept=".pdf,image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                disabled={isPending}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <CloudUpload className="w-8 h-8 text-primary/50" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop file here or click to browse
                    </p>
                    <p className="text-xs">PDF, JPG, PNG — max 100MB</p>
                  </div>
                </div>
              )}
              <span
                data-ocid="upload.upload_button"
                className="mt-3 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") e.stopPropagation();
                }}
              >
                Browse Files
              </span>
            </label>

            {/* Upload progress */}
            {isPending && uploadProgress > 0 && (
              <div data-ocid="upload.loading_state" className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              data-ocid={
                isEdit ? "edit_note.cancel_button" : "upload.cancel_button"
              }
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground"
              data-ocid={
                isEdit ? "edit_note.save_button" : "upload.submit_button"
              }
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? "Saving..." : "Uploading..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Upload Note"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
