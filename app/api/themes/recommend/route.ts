import { NextRequest, NextResponse } from "next/server";
import { THEMES } from "@/lib/themes/registry";
import { buildThemeRows, EMPTY_INTERACTIONS, UserInteractions } from "@/lib/themes/recommend";
import { supabase } from "@/lib/db/client";

// Netflix-style recommendation rows for the home page. Reads the user's interactions (gracefully
// empty if the table is missing) and scores the catalog server-side, so the client only receives
// the handful of themes it shows — never the full 1.3MB catalog.
async function getInteractions(userId: string | null): Promise<UserInteractions> {
  if (!userId) return EMPTY_INTERACTIONS;
  try {
    const { data, error } = await supabase
      .from("theme_interactions")
      .select("theme_id, type")
      .eq("user_id", userId);
    if (error || !data) return EMPTY_INTERACTIONS;
    const ix: UserInteractions = { likes: [], bookmarks: [], views: [] };
    for (const row of data) {
      if (row.type === "like") ix.likes.push(row.theme_id);
      else if (row.type === "bookmark") ix.bookmarks.push(row.theme_id);
      else if (row.type === "view") ix.views.push(row.theme_id);
    }
    return ix;
  } catch {
    return EMPTY_INTERACTIONS;
  }
}

async function getUpcomingEvents(userId: string | null) {
  if (!userId) return [];
  try {
    const nowTs = Date.now();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("title, event_date, event_type, theme_id")
      .eq("user_id", userId);
    if (error || !data) return [];
    
    // filter upcoming in next 30 days
    return data.filter(e => {
       const d = new Date(e.event_date).getTime();
       return d >= nowTs - 86400000 && d <= nowTs + 30 * 86400000;
    });
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  const [ix, events] = await Promise.all([
    getInteractions(userId),
    getUpcomingEvents(userId)
  ]);
  const rows = buildThemeRows(THEMES, ix, events);
  return NextResponse.json({ rows });
}
