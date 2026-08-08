import { useEffect, useState, useCallback, useRef } from "react";
import { useUserId } from "./useUserId";
import { SavedCard, Reaction } from "../themes/types";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_ENTRIES = 50;

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

/**
 * Small LRU response cache.
 *
 * The previous plain object grew without bound for the life of the tab: every distinct URL
 * (including one per user id ever seen) stayed resident forever, and expired entries were
 * never evicted, only ignored.
 */
const responseCache = new Map<string, CacheEntry>();

function readCache(url: string): unknown | undefined {
  const entry = responseCache.get(url);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp >= CACHE_TTL) {
    responseCache.delete(url);
    return undefined;
  }
  // Refresh recency so eviction drops genuinely cold entries.
  responseCache.delete(url);
  responseCache.set(url, entry);
  return entry.data;
}

function writeCache(url: string, data: unknown): void {
  responseCache.set(url, { data, timestamp: Date.now() });
  while (responseCache.size > CACHE_MAX_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest === undefined) break;
    responseCache.delete(oldest);
  }
}

/** Drops cached responses. Call after a mutation so the next read is fresh. */
export function clearApiCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    responseCache.clear();
    return;
  }
  for (const key of [...responseCache.keys()]) {
    if (key.startsWith(urlPrefix)) responseCache.delete(key);
  }
}

async function fetchWithCache(url: string, force = false): Promise<unknown> {
  if (!force) {
    const cached = readCache(url);
    if (cached !== undefined) return cached;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  const data = await res.json();
  writeCache(url, data);
  return data;
}

interface ResourceState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * Shared per-user fetch hook backing every dashboard resource below.
 *
 * All six hooks previously repeated the same body, each with `any`-typed state and a
 * synchronous `setLoading(true)` in the effect body (an extra render pass before the request
 * even starts). State here is only written from async callbacks, and a request-id guard drops
 * responses from a superseded userId so a slow earlier request can't overwrite newer data.
 */
function useApiResource<T>(
  buildUrl: (userId: string) => string,
  fallback: T,
  options: { alwaysFresh?: boolean } = {}
) {
  const userId = useUserId();
  const { alwaysFresh = false } = options;

  const [state, setState] = useState<ResourceState<T>>({
    data: fallback,
    loading: true,
    error: null,
  });

  // Incremented per request, only the newest one may commit.
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  // Keep the latest builder/fallback without making them effect dependencies, the call sites
  // below pass inline arrows that would otherwise change identity every render.
  const buildUrlRef = useRef(buildUrl);
  buildUrlRef.current = buildUrl;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(
    async (force = alwaysFresh) => {
      if (!userId) return;
      const requestId = ++requestIdRef.current;

      try {
        const result = (await fetchWithCache(buildUrlRef.current(userId), force)) as T;
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setState({ data: result ?? fallbackRef.current, loading: false, error: null });
      } catch (err) {
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
      }
    },
    [userId, alwaysFresh]
  );

  useEffect(() => {
    if (!userId) return;
    void refetch();
  }, [userId, refetch]);

  return {
    data: state.data,
    loading: state.loading || !userId,
    error: state.error,
    refetch,
  };
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_type: string;
  theme_id: string | null;
  card_id: string | null;
  created_at?: string;
  is_global?: boolean;
  month?: number | null;
  day?: number | null;
  rule?: string | null;
}

export interface MediaFile {
  name: string;
  url: string;
  type: "photo" | "voice";
  created_at: string;
}

export type ReactionWithCard = Reaction & {
  cards: { id: string; config: Record<string, unknown> };
};

export interface AnalyticsSummary {
  totalCards: number;
  totalViews: number;
  totalShares: number;
  totalReactions: number;
}

const EMPTY_CARDS: SavedCard[] = [];
const EMPTY_REACTIONS: ReactionWithCard[] = [];
const EMPTY_EVENTS: CalendarEvent[] = [];
const EMPTY_MEDIA: MediaFile[] = [];
const EMPTY_ANALYTICS: AnalyticsSummary = {
  totalCards: 0,
  totalViews: 0,
  totalShares: 0,
  totalReactions: 0,
};

export function useMyCards() {
  // Always fresh: a cached snapshot made newly created/deleted cards appear stale.
  return useApiResource<SavedCard[]>(
    (userId) => `/api/cards?userId=${encodeURIComponent(userId)}`,
    EMPTY_CARDS,
    { alwaysFresh: true }
  );
}

export function useMyReactions() {
  return useApiResource<ReactionWithCard[]>(
    (userId) => `/api/cards/reactions?userId=${encodeURIComponent(userId)}`,
    EMPTY_REACTIONS
  );
}

export function useMyCollabs() {
  return useApiResource<SavedCard[]>(
    (userId) => `/api/cards?userId=${encodeURIComponent(userId)}&collaborative=true`,
    EMPTY_CARDS
  );
}

export function useMyCalendarEvents() {
  return useApiResource<CalendarEvent[]>(
    (userId) => `/api/cards/calendar?userId=${encodeURIComponent(userId)}`,
    EMPTY_EVENTS
  );
}

export function useAnalyticsSummary() {
  // Always fresh, a cached snapshot made analytics look like it "wasn't updating".
  return useApiResource<AnalyticsSummary>(
    (userId) => `/api/cards/analytics?userId=${encodeURIComponent(userId)}`,
    EMPTY_ANALYTICS,
    { alwaysFresh: true }
  );
}

export function useMyMedia() {
  return useApiResource<MediaFile[]>(
    (userId) => `/api/media?userId=${encodeURIComponent(userId)}`,
    EMPTY_MEDIA
  );
}

export interface DashboardSummaryData {
  analytics: AnalyticsSummary;
  reactions: ReactionWithCard[];
  collabs: SavedCard[];
  calendarEvents: CalendarEvent[];
}

const EMPTY_SUMMARY: DashboardSummaryData = {
  analytics: EMPTY_ANALYTICS,
  reactions: [],
  collabs: [],
  calendarEvents: [],
};

export function useDashboardSummary() {
  return useApiResource<DashboardSummaryData>(
    (userId) => `/api/dashboard/summary?userId=${encodeURIComponent(userId)}`,
    EMPTY_SUMMARY
  );
}
