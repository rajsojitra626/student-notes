import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpenCheck, Filter, Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { NoteCard } from "../components/NoteCard";
import { useDebounce } from "../hooks/useDebounce";
import { useGetAllNotes, useSearchNotes } from "../hooks/useQueries";

const CLASS_LEVELS = [
  "All",
  ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`),
  ...Array.from({ length: 10 }, (_, i) => `Sem ${i + 1}`),
];

export function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classLevelFilter, setClassLevelFilter] = useState("All");

  const debouncedSearch = useDebounce(searchQuery, 400);

  const isSearching = debouncedSearch.trim().length > 0;

  const allNotes = useGetAllNotes(
    !isSearching && subjectFilter.trim() ? subjectFilter.trim() : null,
    !isSearching && classLevelFilter !== "All" ? classLevelFilter : null,
  );

  const searchResults = useSearchNotes(debouncedSearch);

  const notes = isSearching
    ? (searchResults.data ?? [])
    : (allNotes.data ?? []);
  const isLoading = isSearching ? searchResults.isLoading : allNotes.isLoading;

  const hasFilters = subjectFilter.trim() !== "" || classLevelFilter !== "All";

  const clearFilters = () => {
    setSubjectFilter("");
    setClassLevelFilter("All");
  };

  // Filter notes client-side when searching
  const displayedNotes = isSearching
    ? notes
    : notes.filter((note) => {
        const subjectMatch =
          !subjectFilter.trim() ||
          note.subject
            .toLowerCase()
            .includes(subjectFilter.toLowerCase().trim());
        const classMatch =
          classLevelFilter === "All" || note.classLevel === classLevelFilter;
        return subjectMatch && classMatch;
      });

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground">
          Browse Notes
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover study materials shared by fellow students
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card rounded-2xl card-shadow p-4 mb-8"
      >
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="notes.search_input"
              className="pl-9 h-11 text-base"
              placeholder="Search notes by title, subject, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters row */}
          {!isSearching && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  data-ocid="notes.subject_input"
                  className="h-9"
                  placeholder="Filter by subject..."
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                />
              </div>
              <Select
                value={classLevelFilter}
                onValueChange={setClassLevelFilter}
              >
                <SelectTrigger
                  data-ocid="notes.class_select"
                  className="h-9 sm:w-44"
                >
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground gap-1 h-9"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Active filter badges */}
        {!isSearching && hasFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
            {subjectFilter.trim() && (
              <Badge variant="secondary" className="gap-1">
                Subject: {subjectFilter}
                <button type="button" onClick={() => setSubjectFilter("")}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {classLevelFilter !== "All" && (
              <Badge variant="secondary" className="gap-1">
                {classLevelFilter}
                <button
                  type="button"
                  onClick={() => setClassLevelFilter("All")}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Results count */}
      {!isLoading && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isSearching ? (
              <>
                {displayedNotes.length} result
                {displayedNotes.length !== 1 ? "s" : ""} for "
                <span className="text-foreground font-medium">
                  {debouncedSearch}
                </span>
                "
              </>
            ) : (
              <>
                {displayedNotes.length} note
                {displayedNotes.length !== 1 ? "s" : ""} found
              </>
            )}
          </p>
        </div>
      )}

      {/* Notes Grid */}
      {isLoading ? (
        <div
          data-ocid="notes.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div
              key={key}
              className="bg-card rounded-xl card-shadow p-5 space-y-3"
            >
              <Skeleton className="h-5 w-3/4 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="pt-2 flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-7 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="notes.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BookOpenCheck className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No notes found
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {isSearching
              ? `No notes match "${debouncedSearch}". Try different keywords.`
              : hasFilters
                ? "No notes match your filters. Try adjusting them."
                : "Be the first to share notes! Click 'Upload Note' to get started."}
          </p>
          {hasFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </motion.div>
      ) : (
        <div
          data-ocid="notes.list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {displayedNotes.map((note, index) => (
            <NoteCard key={note.id} note={note} index={index} isOwner={false} />
          ))}
        </div>
      )}
    </main>
  );
}
