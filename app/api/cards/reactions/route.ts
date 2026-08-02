import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    let query = supabase
      .from("reactions")
      .select("*, cards!inner(id, config)");

    if (process.env.NODE_ENV === "development") {
      // OR on an embedded resource must target the referenced table, not a dotted column path.
      query = query.or(`user_id.eq.${userId},user_id.is.null`, { referencedTable: "cards" });
    } else {
      query = query.eq("cards.user_id", userId);
    }

    const { data: reactions, error: err } = await query.order("created_at", { ascending: false });

    if (err) {
      console.error("Database query reactions error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(reactions || []);
  } catch (err) {
    console.error("API GET reactions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
