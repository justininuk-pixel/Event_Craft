"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/db/client";
import { Contribution } from "@/lib/themes/types";

/**
 * Live list of contributions for a collaborative card. Seeds with `initial`,
 * subscribes to Supabase Realtime for instant inserts/deletes, and polls every
 * 12s as a fallback (covers the window before the realtime migration is applied).
 */
export function useRealtimeContributions(cardId: string | undefined, initial: Contribution[] = []) {
  const [contributions, setContributions] = useState<Contribution[]>(initial);

  const refetch = useCallback(async () => {
    if (!cardId) return;
    try {
      const res = await fetch(`/api/cards/${cardId}/contributions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.contributions)) setContributions(data.contributions);
      }
    } catch {
      /* ignore transient fetch errors */
    }
  }, [cardId]);

  useEffect(() => {
    if (!cardId) return;

    const channel = supabase
      .channel(`contributions-${cardId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contributions", filter: `card_id=eq.${cardId}` },
        (payload) => {
          const row = payload.new as Contribution;
          setContributions((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "contributions", filter: `card_id=eq.${cardId}` },
        (payload) => {
          const oldId = (payload.old as { id?: string })?.id;
          if (oldId) setContributions((prev) => prev.filter((c) => c.id !== oldId));
        }
      )
      .subscribe();

    // Pull current state once on mount, then poll as a realtime fallback.
    refetch();
    const poll = setInterval(refetch, 12000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [cardId, refetch]);

  return { contributions, setContributions, refetch };
}
