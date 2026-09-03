import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ApplicationStatus } from "../types";

const STORAGE_KEY = "grantfinder:bookmarks";

export interface BookmarkEntry {
  status: ApplicationStatus;
  note: string;
}

type BookmarksMap = Record<string, BookmarkEntry>;

const DEFAULT_ENTRY: BookmarkEntry = { status: "not-started", note: "" };

function loadBookmarks(): BookmarksMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Migrate from the old "array of bookmarked ids" format.
      const map: BookmarksMap = {};
      for (const id of parsed) {
        if (typeof id === "string") map[id] = { ...DEFAULT_ENTRY };
      }
      return map;
    }
    if (parsed && typeof parsed === "object") return parsed as BookmarksMap;
    return {};
  } catch {
    return {};
  }
}

interface BookmarksContextValue {
  bookmarkedIds: Set<string>;
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
  getEntry: (id: string) => BookmarkEntry;
  setStatus: (id: string, status: ApplicationStatus) => void;
  setNote: (id: string, note: string) => void;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarksMap>(() => loadBookmarks());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // localStorage unavailable (private mode, etc.) — bookmarks just won't persist
    }
  }, [bookmarks]);

  const value = useMemo<BookmarksContextValue>(() => {
    const bookmarkedIds = new Set(Object.keys(bookmarks));
    return {
      bookmarkedIds,
      isBookmarked: (id) => id in bookmarks,
      toggleBookmark: (id) =>
        setBookmarks((prev) => {
          const next = { ...prev };
          if (id in next) delete next[id];
          else next[id] = { ...DEFAULT_ENTRY };
          return next;
        }),
      getEntry: (id) => bookmarks[id] ?? DEFAULT_ENTRY,
      setStatus: (id, status) =>
        setBookmarks((prev) => (id in prev ? { ...prev, [id]: { ...prev[id], status } } : prev)),
      setNote: (id, note) =>
        setBookmarks((prev) => (id in prev ? { ...prev, [id]: { ...prev[id], note } } : prev)),
    };
  }, [bookmarks]);

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within a BookmarksProvider");
  return ctx;
}
