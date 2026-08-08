import { NextRequest, NextResponse } from "next/server";
import { addReaction, getReactions, getReactionSummary } from "@/lib/db/reactions";
import { ReactionSchema } from "@/lib/db/schemas";
import { sanitizeText } from "@/lib/utils/validation";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/request";

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
    const rateCheck = await checkRateLimit(getClientIp(req), {
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
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // ReactionSchema already existed but was never applied, so emoji/message/displayName were
    // stored with no length bound at all.
    const parsed = ReactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") },
        { status: 400 }
      );
    }

    const { emoji, message, displayName } = parsed.data;

    const reaction = await addReaction(
      cardId,
      sanitizeText(emoji, 16),
      message ? sanitizeText(message, 500) : null,
      displayName ? sanitizeText(displayName, 50) : null
    );
    return NextResponse.json({ reaction }, { status: 201 });
  } catch (err) {
    console.error("API reactions POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
