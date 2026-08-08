import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";
import { APP_CONFIG } from "../../../../lib/config/app-config";
import { toPublicCard } from "../../../../lib/db/cards";
import type { SavedCard } from "../../../../lib/themes/types";
import { expandRecurrence, getGlobalEventDate } from "../../../../lib/utils/recurrence";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const now = new Date();
    const currentYear = now.getUTCFullYear();

    // NOTE: every filter below uses `.eq()`, which is parameterised. The previous
    // development-only branches interpolated userId into PostgREST `.or()` filter strings,
    // where a value containing a comma or a dotted operator rewrites the filter.

    // 1. Fetch Analytics (Cards)
    const analyticsQuery = supabase
      .from("cards")
      .select("id, view_count, shares")
      .eq("user_id", userId);

    // 2. Fetch Reactions
    const reactionsQuery = supabase
      .from("reactions")
      .select("*, cards!inner(id, config)")
      .eq("cards.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(APP_CONFIG.pagination.dashboardItems);

    // 3. Fetch Collabs
    const collabsQuery = supabase
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .eq("is_collaborative", true)
      .order("created_at", { ascending: false })
      .limit(APP_CONFIG.pagination.dashboardItems);

    // 4. Fetch Calendar Events (User + Global)
    const userEventsQuery = supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId);
      
    const globalEventsQuery = supabase
      .from("global_events")
      .select("*");

    // 5. Total reaction count. Counted server-side with head:true rather than fetching every
    //    row just to read `.length` off it.
    const reactionsCountQuery = supabase
      .from("reactions")
      .select("id, cards!inner(id)", { count: "exact", head: true })
      .eq("cards.user_id", userId);

    // Execute all concurrently
    const [
      { data: cards, error: cardsErr },
      { data: reactions, error: reactionsErr },
      { data: collabs, error: collabsErr },
      { data: userEventsRaw, error: userEventsErr },
      { data: globalHolidays, error: globalEventsErr },
      { count: reactionsTotal, error: allReactionsErr }
    ] = await Promise.all([
      analyticsQuery,
      reactionsQuery,
      collabsQuery,
      userEventsQuery,
      globalEventsQuery,
      reactionsCountQuery
    ]);

    if (cardsErr) console.error("Error fetching cards:", cardsErr);
    if (reactionsErr) console.error("Error fetching reactions:", reactionsErr);
    if (collabsErr) console.error("Error fetching collabs:", collabsErr);
    if (userEventsErr) console.error("Error fetching userEvents:", userEventsErr);
    if (globalEventsErr) console.error("Error fetching globalEvents:", globalEventsErr);
    if (allReactionsErr) console.error("Error fetching allReactions:", allReactionsErr);

    // Process Analytics
    const totalCards = cards?.length || 0;
    const totalViews = cards?.reduce((acc, card) => acc + (card.view_count || 0), 0) || 0;
    const totalShares = cards?.reduce((acc, card) => acc + (card.shares || 0), 0) || 0;
    const totalReactions = reactionsTotal ?? 0;

    const analytics = {
      totalCards,
      totalViews,
      totalShares,
      totalReactions,
    };

    // Process Calendar (shared with /api/cards/calendar, see lib/utils/recurrence.ts)
    const userEvents = (userEventsRaw || []).map((event) => expandRecurrence(event, now));

    const formattedGlobalEvents = (globalHolidays || [])
      .map((holiday) => {
        const calculatedDate = getGlobalEventDate(holiday, currentYear);
        if (!calculatedDate) return null;
        return {
          id: `global-${holiday.id}`,
          user_id: "global",
          title: holiday.title,
          event_date: calculatedDate,
          event_type: "Holiday",
          theme_id: null,
          card_id: null,
          is_global: true,
          month: holiday.month,
          day: holiday.day,
          rule: holiday.rule,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    const calendarEvents = [...(userEvents || []), ...formattedGlobalEvents];
    calendarEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    // Return the unified summary object
    return NextResponse.json({
      analytics,
      reactions: reactions || [],
      // select("*") includes creator_secret / creator_ip_hash, strip them before responding.
      collabs: (collabs || []).map((c) => toPublicCard(c as SavedCard)),
      calendarEvents,
    });
  } catch (err) {
    console.error("API GET dashboard summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
