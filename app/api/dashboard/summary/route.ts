import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";
import { APP_CONFIG } from "../../../../lib/config/app-config";

// Helpers from calendar logic
function calculateDynamicDate(rule: string, year: number): Date {
  const match = rule.match(/^(First|Second|Third|Fourth|Last)\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+in\s+(January|February|March|April|May|June|July|August|September|October|November|December)$/i);
  if (!match) return new Date(year, 0, 1);
  const [, occurrence, dayName, monthName] = match;
  const monthMap: Record<string, number> = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };
  const dayMap: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const month = monthMap[monthName.toLowerCase()];
  const targetDayOfWeek = dayMap[dayName.toLowerCase()];
  const dates: Date[] = [];
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === targetDayOfWeek) dates.push(date);
  }
  if (occurrence.toLowerCase() === "first") return dates[0];
  if (occurrence.toLowerCase() === "second") return dates[1];
  if (occurrence.toLowerCase() === "third") return dates[2];
  if (occurrence.toLowerCase() === "fourth") return dates[3];
  if (occurrence.toLowerCase() === "last") return dates[dates.length - 1];
  return new Date(year, month, 1);
}

function getGlobalEventDate(event: { month: number | null; day: number | null; rule: string | null }, year: number): string {
  if (event.month !== null && event.day !== null) return new Date(Date.UTC(year, event.month - 1, event.day, 12, 0, 0)).toISOString();
  if (event.rule) {
    const date = calculateDynamicDate(event.rule, year);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)).toISOString();
  }
  return new Date(Date.UTC(year, 0, 1, 12, 0, 0)).toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // 1. Fetch Analytics (Cards)
    let analyticsQuery = supabase
      .from("cards")
      .select("id, view_count, shares");
    if (process.env.NODE_ENV === "development") {
      analyticsQuery = analyticsQuery.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      analyticsQuery = analyticsQuery.eq("user_id", userId);
    }

    // 2. Fetch Reactions
    let reactionsQuery = supabase
      .from("reactions")
      .select("*, cards!inner(id, config)");
    if (process.env.NODE_ENV === "development") {
      // OR on an embedded resource must target the referenced table, not a dotted column path.
      reactionsQuery = reactionsQuery.or(`user_id.eq.${userId},user_id.is.null`, { referencedTable: "cards" });
    } else {
      reactionsQuery = reactionsQuery.eq("cards.user_id", userId);
    }
    reactionsQuery = reactionsQuery.order("created_at", { ascending: false }).limit(APP_CONFIG.pagination.dashboardItems);

    // 3. Fetch Collabs
    let collabsQuery = supabase
      .from("cards")
      .select("*");
    if (process.env.NODE_ENV === "development") {
      collabsQuery = collabsQuery.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      collabsQuery = collabsQuery.eq("user_id", userId);
    }
    collabsQuery = collabsQuery.eq("is_collaborative", true).order("created_at", { ascending: false }).limit(APP_CONFIG.pagination.dashboardItems);

    // 4. Fetch Calendar Events (User + Global)
    const userEventsQuery = supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId);
      
    const globalEventsQuery = supabase
      .from("global_events")
      .select("*");

    // 5. Fetch Reactions Count (concurrently)
    let reactionsCountQuery = supabase
      .from("reactions")
      .select("id, cards!inner(id)");
    if (process.env.NODE_ENV === "development") {
      reactionsCountQuery = reactionsCountQuery.or(`user_id.eq.${userId},user_id.is.null`, { referencedTable: "cards" });
    } else {
      reactionsCountQuery = reactionsCountQuery.eq("cards.user_id", userId);
    }

    // Execute all concurrently
    const [
      { data: cards, error: cardsErr },
      { data: reactions, error: reactionsErr },
      { data: collabs, error: collabsErr },
      { data: userEventsRaw, error: userEventsErr },
      { data: globalHolidays, error: globalEventsErr },
      { data: allReactions, error: allReactionsErr }
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
    const totalReactions = allReactions?.length || 0;

    const analytics = {
      totalCards,
      totalViews,
      totalShares,
      totalReactions,
    };

    // Process Calendar
    const userEvents = (userEventsRaw || []).map(event => {
      if (event.recurrence === 'yearly' || event.recurrence === 'monthly') {
        const originalDate = new Date(event.event_date);
        let targetYear = currentYear;
        let targetMonth = event.recurrence === 'yearly' ? originalDate.getMonth() : currentMonth;
        let targetDate = new Date(Date.UTC(targetYear, targetMonth, originalDate.getDate(), 12, 0, 0));
        
        if (targetDate.getTime() < Date.now() - 86400000) {
           if (event.recurrence === 'yearly') {
             targetYear++;
           } else {
             targetMonth++;
             if (targetMonth > 11) {
               targetMonth = 0;
               targetYear++;
             }
           }
           targetDate = new Date(Date.UTC(targetYear, targetMonth, originalDate.getDate(), 12, 0, 0));
        }
        return { ...event, event_date: targetDate.toISOString() };
      }
      return event;
    });

    const formattedGlobalEvents = (globalHolidays || []).map((holiday) => {
      const calculatedDate = getGlobalEventDate(holiday, currentYear);
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
        rule: holiday.rule
      };
    });

    const calendarEvents = [...(userEvents || []), ...formattedGlobalEvents];
    calendarEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    // Return the unified summary object
    return NextResponse.json({
      analytics,
      reactions: reactions || [],
      collabs: collabs || [],
      calendarEvents,
    });
  } catch (err) {
    console.error("API GET dashboard summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
