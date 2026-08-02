"use client";

// Client-safe access to the theme catalog. These hooks fetch theme data from the server API
// (and cache it at module scope so it's fetched at most once per page session) instead of
// importing the 1.3MB `registry` into the client bundle. Use these in client components rather
// than importing `@/lib/themes/registry`.
import { useEffect, useState } from "react";
import type { Theme } from "./types";
import type { ThemeSummary } from "@/app/api/themes/summary/route";
import type { ThemeRow } from "./recommend";

export type { ThemeSummary, ThemeRow };

// ---- shared module-level caches (one fetch per page session, shared across components) ----
let allThemesCache: Promise<Theme[]> | null = null;
let summariesCache: Promise<ThemeSummary[]> | null = null;

export function fetchAllThemes(): Promise<Theme[]> {
  if (!allThemesCache) {
    allThemesCache = fetch("/api/themes/all")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
  }
  return allThemesCache;
}

export function fetchThemeSummaries(): Promise<ThemeSummary[]> {
  if (!summariesCache) {
    summariesCache = fetch("/api/themes/summary")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
  }
  return summariesCache;
}

/** Full theme catalog (with previews). For /explore and the editor switcher. */
export function useAllThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAllThemes().then((data) => {
      if (!active) return;
      setThemes(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { themes, loading };
}

/** Lightweight theme metadata. For search/labels that don't need full previews. */
export function useThemeSummaries() {
  const [summaries, setSummaries] = useState<ThemeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchThemeSummaries().then((data) => {
      if (!active) return;
      setSummaries(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { summaries, loading };
}

/** Personalized home rows. */
export function useThemeRows(userId: string | null) {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const url = userId ? `/api/themes/recommend?userId=${encodeURIComponent(userId)}` : "/api/themes/recommend";
    fetch(url)
      .then((r) => (r.ok ? r.json() : { rows: [] }))
      .catch(() => ({ rows: [] }))
      .then((data: { rows: ThemeRow[] }) => {
        if (!active) return;
        setRows(data.rows || []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return { rows, loading };
}
