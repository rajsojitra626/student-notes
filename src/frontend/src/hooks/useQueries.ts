import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { Note } from "../backend.d";
import { useActor } from "./useActor";

// ---------- Queries ----------

export function useGetAllNotes(
  subjectFilter: string | null,
  classLevelFilter: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes", "all", subjectFilter, classLevelFilter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotes(subjectFilter, classLevelFilter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchNotes(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes", "search", keyword],
    queryFn: async () => {
      if (!actor) return [];
      if (!keyword.trim()) return [];
      return actor.searchNotes(keyword);
    },
    enabled: !!actor && !isFetching && keyword.trim().length > 0,
  });
}

export function useGetNote(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Note>({
    queryKey: ["notes", "detail", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getNote(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetUserNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes", "user"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---------- Mutations ----------

export interface CreateNoteInput {
  title: string;
  subject: string;
  classLevel: string;
  description: string | null;
  file: File | null;
  onProgress?: (pct: number) => void;
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      subject,
      classLevel,
      description,
      file,
      onProgress,
    }: CreateNoteInput) => {
      if (!actor) throw new Error("Not authenticated");
      let blob: ExternalBlob | null = null;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        blob = ExternalBlob.fromBytes(bytes);
        if (onProgress) {
          blob = blob.withUploadProgress(onProgress);
        }
      }
      return actor.createNote(title, subject, classLevel, description, blob);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export interface UpdateNoteInput {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  description: string | null;
  file: File | null;
  keepExistingFile: boolean;
  existingBlob?: ExternalBlob;
  onProgress?: (pct: number) => void;
}

export function useUpdateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      subject,
      classLevel,
      description,
      file,
      keepExistingFile,
      existingBlob,
      onProgress,
    }: UpdateNoteInput) => {
      if (!actor) throw new Error("Not authenticated");

      let blob: ExternalBlob | null = null;
      if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        blob = ExternalBlob.fromBytes(bytes);
        if (onProgress) {
          blob = blob.withUploadProgress(onProgress);
        }
      } else if (keepExistingFile && existingBlob) {
        blob = existingBlob;
      }

      return actor.updateNote(
        id,
        title,
        subject,
        classLevel,
        description,
        blob,
      );
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
      void queryClient.invalidateQueries({
        queryKey: ["notes", "detail", variables.id],
      });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteNote(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
