import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // 1. Fetch user's cards to get views, shares, and IDs.
    // `.eq()` is parameterised. The old development branch interpolated userId into a
    // PostgREST `.or()` filter string, which a crafted id can rewrite.
    const cardsQuery = supabase
      .from("cards")
      .select("id, view_count, shares")
      .eq("user_id", userId);

    const { data: cards, error: cardsErr } = await cardsQuery;

    if (cardsErr) {
      console.error("Database query cards error in analytics:", cardsErr);
      return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }

    const totalCards = cards?.length || 0;
    const totalViews = cards?.reduce((acc, card) => acc + (card.view_count || 0), 0) || 0;
    const totalShares = cards?.reduce((acc, card) => acc + (card.shares || 0), 0) || 0;

    let totalReactions = 0;
    const cardIds = cards?.map((c) => c.id) || [];

    if (cardIds.length > 0) {
      // Count server-side instead of fetching every reaction row just to read `.length`.
      const { count, error: reactionsErr } = await supabase
        .from("reactions")
        .select("id", { count: "exact", head: true })
        .in("card_id", cardIds);

      if (reactionsErr) {
        console.error("Database query reactions error in analytics:", reactionsErr);
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
      }
      totalReactions = count ?? 0;
    }

    return NextResponse.json({
      totalCards,
      totalViews,
      totalShares,
      totalReactions,
    });
  } catch (err) {
    console.error("API GET analytics error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
