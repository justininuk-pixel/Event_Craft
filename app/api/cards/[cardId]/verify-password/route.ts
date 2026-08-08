import { NextRequest, NextResponse } from "next/server";
import { getCard, toPublicCard } from "@/lib/db/cards";
import { getContributions } from "@/lib/db/contributions";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/request";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;

    // Passcode checks are the one endpoint worth brute-forcing, and the previous attempt
    // counter lived entirely in the client, so calling this route directly bypassed it.
    const rateCheck = await checkRateLimit(getClientIp(req), {
      endpoint: "POST /api/cards/verify-password",
      windowMs: 5 * 60_000,
      maxRequests: 10,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many passcode attempts. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": "300" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { password, type } = body as { password?: unknown; type?: unknown };

    if (typeof password !== "string" || !password || typeof type !== "string") {
      return NextResponse.json({ error: "Missing password or type" }, { status: 400 });
    }

    if (type !== "view" && type !== "collab") {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const hash = type === "view" ? card.password_hash : card.collab_password;

    // No passcode configured for this gate: nothing to verify, the card is simply public.
    if (!hash) {
      return NextResponse.json({ success: true, card: toPublicCard(card) });
    }

    if (!bcrypt.compareSync(password, hash)) {
      // Deliberately no detail about why, and no card payload.
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // Correct passcode: this is the only path that hands out the real card content.
    const unlocked = toPublicCard(card);

    if (type === "view" && card.is_collaborative) {
      let contributions;
      try {
        contributions = await getContributions(cardId);
      } catch {
        /* contributions are optional, an error here shouldn't block the unlock */
      }
      return NextResponse.json({ success: true, card: unlocked, contributions });
    }

    return NextResponse.json({ success: true, card: unlocked });
  } catch (err) {
    console.error("Error in verify-password API:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
