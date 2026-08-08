import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";
import { APP_CONFIG } from "../../../../lib/config/app-config";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // `.eq()` is parameterised. The old development branch interpolated userId into a
    // PostgREST `.or()` filter string, which a crafted id can rewrite.
    const query = supabase
      .from("reactions")
      .select("*, cards!inner(id, config)")
      .eq("cards.user_id", userId)
      .limit(APP_CONFIG.pagination.dashboardItems);

    const { data: reactions, error: err } = await query.order("created_at", { ascending: false });

    if (err) {
      console.error("Database query reactions error:", err);
      return NextResponse.json({ error: "Failed to load reactions" }, { status: 500 });
    }

    return NextResponse.json(reactions || []);
  } catch (err) {
    console.error("API GET reactions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
