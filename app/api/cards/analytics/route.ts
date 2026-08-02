import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // 1. Fetch user's cards to get views, shares, and IDs
    let cardsQuery = supabase
      .from("cards")
      .select("id, view_count, shares");

    if (process.env.NODE_ENV === "development") {
      cardsQuery = cardsQuery.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      cardsQuery = cardsQuery.eq("user_id", userId);
    }

    const { data: cards, error: cardsErr } = await cardsQuery;

    if (cardsErr) {
      console.error("Database query cards error in analytics:", cardsErr);
      return NextResponse.json({ error: cardsErr.message }, { status: 500 });
    }

    const totalCards = cards?.length || 0;
    const totalViews = cards?.reduce((acc, card) => acc + (card.view_count || 0), 0) || 0;
    const totalShares = cards?.reduce((acc, card) => acc + (card.shares || 0), 0) || 0;

    let totalReactions = 0;
    const cardIds = cards?.map((c) => c.id) || [];

    if (cardIds.length > 0) {
      const { data: reactions, error: reactionsErr } = await supabase
        .from("reactions")
        .select("id")
        .in("card_id", cardIds);

      if (reactionsErr) {
        console.error("Database query reactions error in analytics:", reactionsErr);
        return NextResponse.json({ error: reactionsErr.message }, { status: 500 });
      }
      totalReactions = reactions?.length || 0;
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
