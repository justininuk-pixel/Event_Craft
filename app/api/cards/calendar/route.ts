import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";

function calculateDynamicDate(rule: string, year: number): Date {
  const match = rule.match(/^(First|Second|Third|Fourth|Last)\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+in\s+(January|February|March|April|May|June|July|August|September|October|November|December)$/i);
  if (!match) {
    return new Date(year, 0, 1);
  }

  const [, occurrence, dayName, monthName] = match;
  const monthMap: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
  };

  const month = monthMap[monthName.toLowerCase()];
  const targetDayOfWeek = dayMap[dayName.toLowerCase()];

  const dates: Date[] = [];
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() !== month) break;
    if (date.getDay() === targetDayOfWeek) {
      dates.push(date);
    }
  }

  if (occurrence.toLowerCase() === "first") return dates[0];
  if (occurrence.toLowerCase() === "second") return dates[1];
  if (occurrence.toLowerCase() === "third") return dates[2];
  if (occurrence.toLowerCase() === "fourth") return dates[3];
  if (occurrence.toLowerCase() === "last") return dates[dates.length - 1];

  return new Date(year, month, 1);
}

function getGlobalEventDate(event: { month: number | null; day: number | null; rule: string | null }, year: number): string {
  if (event.month !== null && event.day !== null) {
    return new Date(Date.UTC(year, event.month - 1, event.day, 12, 0, 0)).toISOString();
  }
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

    // 1. Fetch user's custom calendar events
    const { data: userEventsRaw, error: err } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId);

    if (err) {
      console.error("Database query calendar error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const userEvents = (userEventsRaw || []).map(event => {
      if (event.recurrence === 'yearly' || event.recurrence === 'monthly') {
        const originalDate = new Date(event.event_date);
        let targetYear = currentYear;
        let targetMonth = event.recurrence === 'yearly' ? originalDate.getMonth() : currentMonth;
        let targetDate = new Date(Date.UTC(targetYear, targetMonth, originalDate.getDate(), 12, 0, 0));
        
        // If the date has already passed this year/month, show the next occurrence
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

    // 2. Fetch global holidays from database
    const { data: globalHolidays, error: gErr } = await supabase
      .from("global_events")
      .select("*");

    if (gErr) {
      console.warn("Failed to fetch global events:", gErr);
    }

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

    // Merge user events and global events
    const mergedEvents = [...(userEvents || []), ...formattedGlobalEvents];
    mergedEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    return NextResponse.json(mergedEvents);
  } catch (err) {
    console.error("API GET calendar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, title, event_date, event_type, theme_id, card_id, recurrence } = body;

    if (!user_id || !title || !event_date || !event_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id,
        title,
        event_date,
        event_type,
        theme_id: theme_id || null,
        card_id: card_id || null,
        recurrence: recurrence || 'single',
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert event error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("API POST calendar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
