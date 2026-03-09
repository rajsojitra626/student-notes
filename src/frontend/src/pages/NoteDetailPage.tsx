import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  FileText,
  GraduationCap,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Note } from "../backend.d";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { NoteFormModal } from "../components/NoteFormModal";
import { useDeleteNote, useGetNote } from "../hooks/useQueries";

function formatDate(time: bigint): string {
  const ms = Number(time / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NoteDetailPage() {
  const { id } = useParams({ from: "/notes/$id" });
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: note, isLoading, error } = useGetNote(id);
  const deleteNote = useDeleteNote();

  const isOwner = false;

  const handleDelete = async () => {
    if (!note) return;
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success("Note deleted successfully");
      void navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete note");
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-10 w-3/4 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div data-ocid="note_detail.error_state" className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">
            Note not found
          </h2>
          <p className="text-muted-foreground mb-6">
            This note may have been deleted or doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground gap-2 -ml-2"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </Button>
      </motion.div>

      {/* Note content card */}
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-2xl card-shadow overflow-hidden"
      >
        {/* Header gradient strip */}
        <div
          className="h-2 w-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.42 0.18 265), oklch(0.55 0.16 200))",
          }}
        />

        <div className="p-6 sm:p-8">
          {/* Title & actions */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight flex-1">
              {note.title}
            </h1>
            {isOwner && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  className="gap-2"
                  data-ocid="note_detail.edit_button"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  data-ocid="note_detail.delete_button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <GraduationCap className="w-3.5 h-3.5" />
              {note.subject}
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1">
              <BookOpen className="w-3.5 h-3.5" />
              {note.classLevel}
            </Badge>
          </div>

          {/* Description */}
          {note.description && (
            <div className="bg-muted/40 rounded-xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-2">
                Description
              </h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {note.description}
              </p>
            </div>
          )}

          {/* File attachment */}
          {note.file && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/15">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Attachment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF / Image file attached
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const url = note.file?.getDirectURL();
                  if (url) window.open(url, "_blank");
                }}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                data-ocid="note_detail.download_button"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          )}

          {/* Footer meta */}
          <div className="border-t border-border pt-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>
                Uploaded by:{" "}
                <span className="text-foreground font-medium">
                  {`${note.owner.toString().slice(0, 12)}...`}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Edit Modal */}
      {editOpen && (
        <NoteFormModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          editNote={note as Note}
        />
      )}

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={note.title}
        isPending={deleteNote.isPending}
      />
    </main>
  );
}
