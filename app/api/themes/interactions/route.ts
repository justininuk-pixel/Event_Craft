import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/client";

// Theme like/bookmark/view interactions. Backed by the `theme_interactions` table, but degrades
// gracefully (empty reads / no-op writes) when the migration hasn't been run yet, the client
// keeps a localStorage mirror so the feature works regardless.
const VALID_TYPES = ["like", "bookmark", "view"] as const;
type InteractionType = (typeof VALID_TYPES)[number];

interface InteractionsResponse {
  likes: string[];
  bookmarks: string[];
  views: string[];
}

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  const empty: InteractionsResponse = { likes: [], bookmarks: [], views: [] };
  if (!userId) return NextResponse.json(empty);

  try {
    const { data, error } = await supabase
      .from("theme_interactions")
      .select("theme_id, type")
      .eq("user_id", userId);

    if (error || !data) return NextResponse.json(empty);

    const result: InteractionsResponse = { likes: [], bookmarks: [], views: [] };
    for (const row of data) {
      if (row.type === "like") result.likes.push(row.theme_id);
      else if (row.type === "bookmark") result.bookmarks.push(row.theme_id);
      else if (row.type === "view") result.views.push(row.theme_id);
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(empty);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string = body.userId;
    const themeId: string = body.themeId;
    const type: InteractionType = body.type;
    const action: "add" | "remove" = body.action;

    if (!userId || !themeId || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    if (action === "remove") {
      await supabase
        .from("theme_interactions")
        .delete()
        .eq("user_id", userId)
        .eq("theme_id", themeId)
        .eq("type", type);
    } else {
      // upsert keyed on the (user_id, theme_id, type) unique constraint
      await supabase
        .from("theme_interactions")
        .upsert({ user_id: userId, theme_id: themeId, type }, { onConflict: "user_id,theme_id,type" });
    }
    return NextResponse.json({ ok: true });
  } catch {
    // Table missing or other error, the client's localStorage mirror still holds state.
    return NextResponse.json({ ok: false, degraded: true });
  }
}
