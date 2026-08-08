import { NextRequest, NextResponse } from "next/server";
import { getContributions, addContribution, countContributions } from "@/lib/db/contributions";
import { addRSVP } from "@/lib/db/rsvps";
import { getCard } from "@/lib/db/cards";
import { ContributionSchema, RSVPSchema } from "@/lib/db/schemas";
import { sanitizeText } from "@/lib/utils/validation";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/request";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;

    // Contributions are card content: don't serve them for a passcode-protected card, that
    // would route around the gate on /c/<id>.
    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (card.password_hash) {
      return NextResponse.json({ error: "This card is passcode protected" }, { status: 403 });
    }

    const contributions = await getContributions(cardId);
    return NextResponse.json({ contributions });
  } catch (err) {
    console.error("API contributions GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;

    // Writes here were previously unvalidated and unthrottled: any caller could post
    // unbounded text to any card id.
    const rateCheck = await checkRateLimit(getClientIp(req), {
      endpoint: "POST /api/cards/contributions",
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const { type, name, message, signature, photoUrl, voiceUrl, response, guest_count, note } =
      body as Record<string, unknown>;

    // ---- RSVP ----
    if (type === "rsvp") {
      if (!card.has_rsvp) {
        return NextResponse.json({ error: "This card does not collect RSVPs" }, { status: 400 });
      }

      const parsed = RSVPSchema.safeParse({
        name,
        response: response ?? "yes",
        guestCount: guest_count === undefined || guest_count === null ? 1 : Number(guest_count),
        note: note ?? null,
      });
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") },
          { status: 400 }
        );
      }

      const rsvp = await addRSVP(
        cardId,
        sanitizeText(parsed.data.name, 100),
        parsed.data.response,
        parsed.data.guestCount,
        parsed.data.note ? sanitizeText(parsed.data.note, 500) : null
      );
      return NextResponse.json({ success: true, rsvp }, { status: 201 });
    }

    // ---- Group card contribution ----
    if (!card.is_collaborative) {
      return NextResponse.json(
        { error: "This card is not accepting contributions" },
        { status: 400 }
      );
    }

    const parsed = ContributionSchema.safeParse({
      displayName: name,
      message,
      signature: signature ?? null,
      photoUrl: photoUrl ?? null,
      voiceUrl: voiceUrl ?? null,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") },
        { status: 400 }
      );
    }

    // Enforce the contributor cap the creator configured, it was stored but never checked.
    if (card.max_contributors !== null && card.max_contributors !== undefined) {
      const existing = await countContributions(cardId);
      if (existing >= card.max_contributors) {
        return NextResponse.json(
          { error: "This group card has reached its contributor limit." },
          { status: 409 }
        );
      }
    }

    const contribution = await addContribution(
      cardId,
      sanitizeText(parsed.data.displayName, 50),
      sanitizeText(parsed.data.message, 1000),
      parsed.data.signature ?? null,
      parsed.data.photoUrl || null,
      parsed.data.voiceUrl || null
    );
    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (err) {
    console.error("API contributions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
