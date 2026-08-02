import { NextRequest, NextResponse } from "next/server";
import { getCardWithSecret } from "@/lib/db/cards";
import { getReactions, getReactionSummary } from "@/lib/db/reactions";
import { getContributions } from "@/lib/db/contributions";
import { getRSVPs } from "@/lib/db/rsvps";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (!secret) {
      return NextResponse.json({ error: "Secret token is required" }, { status: 400 });
    }

    // 1. Verify card exists and secret matches
    const card = await getCardWithSecret(cardId, secret);
    if (!card) {
      return NextResponse.json({ error: "Unauthorized or invalid card" }, { status: 403 });
    }

    // 2. Fetch all analytics data in parallel
    const [reactions, reactionSummary, contributions, rsvps] = await Promise.all([
      getReactions(cardId),
      getReactionSummary(cardId),
      card.is_collaborative ? getContributions(cardId) : Promise.resolve([]),
      card.has_rsvp ? getRSVPs(cardId) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      card: {
        id: card.id,
        themeId: card.theme_id,
        config: card.config,
        deliveryStyle: card.delivery_style,
        isCollaborative: card.is_collaborative,
        hasRsvp: card.has_rsvp,
        viewCount: card.view_count,
        createdAt: card.created_at,
        expiresAt: card.expires_at,
      },
      reactions,
      reactionSummary,
      contributions,
      rsvps,
    });
  } catch (err) {
    console.error("Failed to load analytics:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
