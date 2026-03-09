import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import type { Note } from "../backend.d";

interface NoteCardProps {
  note: Note;
  index: number;
  isOwner?: boolean;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

function formatDate(time: bigint): string {
  const ms = Number(time / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getClassBadgeColor(classLevel: string) {
  if (classLevel.startsWith("Sem")) {
    return "bg-accent/30 text-accent-foreground border-accent/40";
  }
  return "bg-secondary text-secondary-foreground border-secondary";
}

export function NoteCard({
  note,
  index,
  isOwner,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      data-ocid={`notes.item.${index + 1}`}
      className="group relative bg-card rounded-xl card-shadow hover:card-shadow-hover transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Top accent strip based on class */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, oklch(0.42 0.18 ${265 + (index % 5) * 20}), oklch(0.55 0.16 ${200 + (index % 4) * 15}))`,
        }}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-base leading-snug line-clamp-2 flex-1">
              {note.title}
            </h3>
          </div>
          {note.file && (
            <div className="shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="text-xs font-medium px-2 py-0.5"
          >
            <GraduationCap className="w-3 h-3 mr-1" />
            {note.subject}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs font-medium px-2 py-0.5 ${getClassBadgeColor(note.classLevel)}`}
          >
            {note.classLevel}
          </Badge>
        </div>

        {/* Description */}
        {note.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {note.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[120px]">
                {note.owner.toString().slice(0, 10)}...
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {note.file && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.preventDefault();
                  const url = note.file?.getDirectURL();
                  if (url) window.open(url, "_blank");
                }}
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.(note);
                  }}
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete?.(note);
                  }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            <Button
              asChild
              size="sm"
              className="h-8 px-3 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-colors"
              variant="ghost"
            >
              <Link to="/notes/$id" params={{ id: note.id }}>
                <Eye className="w-3.5 h-3.5 mr-1" />
                View
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
