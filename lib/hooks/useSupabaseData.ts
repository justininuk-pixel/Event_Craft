import { useEffect, useState, useCallback } from "react";
import { supabase } from "../db/client";
import { useUserId } from "./useUserId";
import { SavedCard, Reaction } from "../themes/types";

const globalCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url: string, force = false) {
  if (!force && globalCache[url] && Date.now() - globalCache[url].timestamp < CACHE_TTL) {
    return globalCache[url].data;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const data = await res.json();
  globalCache[url] = { data, timestamp: Date.now() };
  return data;
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

export function useMyCards() {
  const userId = useUserId();
  const [data, setData] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Fresh each load so newly created/deleted cards show up immediately (was 5-min cached).
      const cards = await fetchWithCache(`/api/cards?userId=${userId}`, true);
      setData(cards || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCards();
    }
  }, [userId, fetchCards]);

  return { data, loading: loading || !userId, error, refetch: fetchCards };
}

export function useMyReactions() {
  const userId = useUserId();
  const [data, setData] = useState<(Reaction & { cards: { id: string; config: any } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReactions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const reactions = await fetchWithCache(`/api/cards/reactions?userId=${userId}`);
      setData(reactions || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchReactions();
    }
  }, [userId, fetchReactions]);

  return { data, loading: loading || !userId, error, refetch: fetchReactions };
}

export function useMyCollabs() {
  const userId = useUserId();
  const [data, setData] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCollabs = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const collabs = await fetchWithCache(`/api/cards?userId=${userId}&collaborative=true`);
      setData(collabs || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCollabs();
    }
  }, [userId, fetchCollabs]);

  return { data, loading: loading || !userId, error, refetch: fetchCollabs };
}

export function useMyCalendarEvents() {
  const userId = useUserId();
  const [data, setData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const events = await fetchWithCache(`/api/cards/calendar?userId=${userId}`);
      setData(events || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId, fetchEvents]);

  return { data, loading: loading || !userId, error, refetch: fetchEvents };
}

export function useAnalyticsSummary() {
  const userId = useUserId();
  const [data, setData] = useState({
    totalCards: 0,
    totalViews: 0,
    totalShares: 0,
    totalReactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Always pull fresh stats — a cached snapshot made the analytics look like it "wasn't
      // updating" after new views/reactions/cards.
      const summary = await fetchWithCache(`/api/cards/analytics?userId=${userId}`, true);
      setData(summary);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId, fetchAnalytics]);

  return { data, loading: loading || !userId, error, refetch: fetchAnalytics };
}

export function useMyMedia() {
  const userId = useUserId();
  const [data, setData] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedia = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const files = await fetchWithCache(`/api/media?userId=${userId}`);
      setData(files);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMedia();
    }
  }, [userId, fetchMedia]);

  return { data, loading: loading || !userId, error, refetch: fetchMedia };
}

export interface DashboardSummaryData {
  analytics: {
    totalCards: number;
    totalViews: number;
    totalShares: number;
    totalReactions: number;
  };
  reactions: (Reaction & { cards: { id: string; config: any } })[];
  collabs: SavedCard[];
  calendarEvents: CalendarEvent[];
}

export function useDashboardSummary() {
  const userId = useUserId();
  const [data, setData] = useState<DashboardSummaryData>({
    analytics: { totalCards: 0, totalViews: 0, totalShares: 0, totalReactions: 0 },
    reactions: [],
    collabs: [],
    calendarEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const summary = await fetchWithCache(`/api/dashboard/summary?userId=${userId}`);
      setData(summary);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSummary();
    }
  }, [userId, fetchSummary]);

  return { data, loading: loading || !userId, error, refetch: fetchSummary };
}
