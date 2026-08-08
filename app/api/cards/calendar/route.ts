import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "../../../../lib/db/client";
import { sanitizeText } from "../../../../lib/utils/validation";
import { checkRateLimit } from "../../../../lib/utils/rate-limit";
import { getClientIp } from "../../../../lib/utils/request";
import { getAuthenticatedUserId } from "../../../../lib/utils/auth";
import { expandRecurrence, getGlobalEventDate } from "../../../../lib/utils/recurrence";

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
      return NextResponse.json({ error: "Failed to load calendar" }, { status: 500 });
    }

    const now = new Date();
    const currentYear = now.getUTCFullYear();

    const userEvents = (userEventsRaw || []).map((event) => expandRecurrence(event, now));

    // 2. Fetch global holidays from database
    const { data: globalHolidays, error: gErr } = await supabase
      .from("global_events")
      .select("*");

    if (gErr) {
      console.warn("Failed to fetch global events:", gErr);
    }

    const formattedGlobalEvents = (globalHolidays || [])
      .map((holiday) => {
        const calculatedDate = getGlobalEventDate(holiday, currentYear);
        // Unresolvable rows are dropped instead of being pinned to January 1st, which used to
        // dump every malformed holiday onto New Year's Day.
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

    // Merge user events and global events
    const mergedEvents = [...(userEvents || []), ...formattedGlobalEvents];
    mergedEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    return NextResponse.json(mergedEvents);
  } catch (err) {
    console.error("API GET calendar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const CalendarEventSchema = z.object({
  user_id: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  event_date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "event_date must be a valid date"),
  event_type: z.string().min(1).max(60),
  theme_id: z.string().max(120).nullish(),
  card_id: z.string().max(64).nullish(),
  recurrence: z.enum(["single", "yearly", "monthly"]).default("single"),
});

export async function POST(req: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(getClientIp(req), {
      endpoint: "POST /api/cards/calendar",
      windowMs: 60_000,
      maxRequests: 20,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Fields were previously written straight through with only a truthiness check, so
    // `recurrence` could be any string (silently breaking the recurrence expansion below) and
    // `event_date` any unparseable value.
    const parsed = CalendarEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") },
        { status: 400 }
      );
    }

    // A signed-in caller may only write to their own calendar, whatever user_id they sent.
    const sessionUserId = await getAuthenticatedUserId(req);
    const userId = sessionUserId ?? parsed.data.user_id;
    if (!sessionUserId && !parsed.data.user_id.startsWith("anon_")) {
      return NextResponse.json(
        { error: "Sign in to add events to a registered account." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
        title: sanitizeText(parsed.data.title, 200),
        event_date: parsed.data.event_date,
        event_type: parsed.data.event_type,
        theme_id: parsed.data.theme_id || null,
        card_id: parsed.data.card_id || null,
        recurrence: parsed.data.recurrence,
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert event error:", error);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("API POST calendar error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
