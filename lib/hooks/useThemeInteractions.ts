"use client";

// Like / bookmark state for themes. localStorage is the instant, offline-safe source of truth;
// changes are mirrored fire-and-forget to Supabase via /api/themes/interactions (which no-ops if
// the migration hasn't run). A zustand store keeps every ThemeCard in sync when one toggles.
import { useEffect } from "react";
import { create } from "zustand";
import { useUserId } from "./useUserId";

type InteractionType = "like" | "bookmark";

const LS_KEY = "cc-theme-interactions-v1";

interface StoredState {
  likes: string[];
  bookmarks: string[];
}

interface InteractionStore {
  likes: Set<string>;
  bookmarks: Set<string>;
  hydrated: boolean;
  userId: string | null;
  hydrate: (userId: string | null) => void;
  toggle: (type: InteractionType, themeId: string) => boolean; // returns the new membership state
}

function readLocal(): StoredState {
  if (typeof window === "undefined") return { likes: [], bookmarks: [] };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { likes: [], bookmarks: [] };
    const parsed = JSON.parse(raw);
    return { likes: parsed.likes ?? [], bookmarks: parsed.bookmarks ?? [] };
  } catch {
    return { likes: [], bookmarks: [] };
  }
}

function writeLocal(likes: Set<string>, bookmarks: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ likes: [...likes], bookmarks: [...bookmarks] }));
  } catch {
    // storage full / unavailable, non-fatal
  }
}

function syncServer(userId: string | null, type: InteractionType, themeId: string, action: "add" | "remove") {
  if (!userId) return;
  // fire-and-forget; failures are fine because localStorage already holds the state
  fetch("/api/themes/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, themeId, type, action }),
  }).catch(() => {});
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  likes: new Set(),
  bookmarks: new Set(),
  hydrated: false,
  userId: null,

  hydrate: (userId) => {
    const cur = get();

    // 1. Seed from localStorage exactly once, this is independent of userId, so it must
    //    not re-run (and must not create fresh Sets) on every call.
    if (!cur.hydrated) {
      const local = readLocal();
      set({
        likes: new Set(local.likes),
        bookmarks: new Set(local.bookmarks),
        hydrated: true,
      });
    }

    // 2. Bail on a placeholder/null id, or if we've already synced this exact user. This is
    //    what prevents the cross-instance loop: many cards each run useUserId, which resolves
    //    at different times, so a still-null instance must NOT overwrite a real userId, and a
    //    real userId must not be re-synced on every render.
    if (!userId || cur.userId === userId) return;
    set({ userId });

    // 3. Merge server-side data for this user (union avoids the table-missing case wiping local).
    fetch(`/api/themes/interactions?userId=${encodeURIComponent(userId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { likes: string[]; bookmarks: string[] } | null) => {
        if (!data) return;
        const now = get();
        const likes = new Set([...now.likes, ...data.likes]);
        const bookmarks = new Set([...now.bookmarks, ...data.bookmarks]);
        writeLocal(likes, bookmarks);
        set({ likes, bookmarks });
      })
      .catch(() => {});
  },

  toggle: (type, themeId) => {
    const state = get();
    const setForType = new Set(type === "like" ? state.likes : state.bookmarks);
    const isActive = setForType.has(themeId);
    if (isActive) setForType.delete(themeId);
    else setForType.add(themeId);

    const likes = type === "like" ? setForType : state.likes;
    const bookmarks = type === "bookmark" ? setForType : state.bookmarks;
    writeLocal(likes, bookmarks);
    set(type === "like" ? { likes: setForType } : { bookmarks: setForType });
    syncServer(state.userId, type, themeId, isActive ? "remove" : "add");
    return !isActive;
  },
}));

/** Mount-once hydration. Call high in the tree (e.g. ThemeCard mounts trigger it; idempotent). */
export function useHydrateInteractions() {
  const userId = useUserId();
  const hydrate = useInteractionStore((s) => s.hydrate);

  // hydrate() is idempotent and self-guarding, so the effect only needs to depend on the
  // resolved userId (and the stable action). Do NOT depend on reactive store values here,
  // that's what let concurrent card instances thrash store.userId in an infinite loop.
  useEffect(() => {
    hydrate(userId);
  }, [userId, hydrate]);
}

/** Convenience hook for a single theme card. */
export function useThemeInteractions(themeId: string) {
  useHydrateInteractions();
  const isLiked = useInteractionStore((s) => s.likes.has(themeId));
  const isBookmarked = useInteractionStore((s) => s.bookmarks.has(themeId));
  const toggle = useInteractionStore((s) => s.toggle);

  return {
    isLiked,
    isBookmarked,
    toggleLike: () => toggle("like", themeId),
    toggleBookmark: () => toggle("bookmark", themeId),
  };
}
