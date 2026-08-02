import { NextRequest, NextResponse } from "next/server";
import { addReaction, getReactions, getReactionSummary } from "@/lib/db/reactions";
import { checkRateLimit } from "@/lib/utils/rate-limit";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const [reactions, summary] = await Promise.all([
      getReactions(cardId),
      getReactionSummary(cardId),
    ]);
    return NextResponse.json({ reactions, summary });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const forwardHeader = req.headers.get("x-forwarded-for");
    const ip = forwardHeader ? forwardHeader.split(",")[0] : "127.0.0.1";

    const rateCheck = await checkRateLimit(ip, {
      endpoint: "POST /api/reactions",
      windowMs: 60_000,
      maxRequests: 20,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before reacting again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { cardId } = await params;
    const body = await req.json();
    const { emoji, message, displayName } = body;

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    const reaction = await addReaction(cardId, emoji, message, displayName);
    return NextResponse.json({ reaction }, { status: 201 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
