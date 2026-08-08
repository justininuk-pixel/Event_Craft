import { NextRequest, NextResponse } from "next/server";
import { addRSVP, getRSVPs } from "@/lib/db/rsvps";
import { getCard, getCardWithSecret } from "@/lib/db/cards";
import { sanitizeText } from "@/lib/utils/validation";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getClientIp } from "@/lib/utils/request";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  response: z.enum(["yes", "no", "maybe"]),
  guest_count: z.number().int().min(1).max(10).default(1),
  note: z.string().max(500).optional().nullable(),
});

/**
 * The guest list is personal data (names, notes, party sizes). It used to be readable by
 * anyone holding the card link, now it requires the creator secret, the same credential the
 * analytics dashboard uses.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const secret = new URL(req.url).searchParams.get("secret");

    if (!secret) {
      return NextResponse.json({ error: "Creator secret is required" }, { status: 401 });
    }

    const card = await getCardWithSecret(cardId, secret);
    if (!card) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const rsvps = await getRSVPs(cardId);
    return NextResponse.json({ rsvps });
  } catch (err) {
    console.error("API rsvps GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;

    const rateCheck = await checkRateLimit(getClientIp(req), {
      endpoint: "POST /api/cards/rsvps",
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many RSVP submissions. Please wait a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parseResult = rsvpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") },
        { status: 400 }
      );
    }

    // Only accept RSVPs for a card that actually collects them.
    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    if (!card.has_rsvp) {
      return NextResponse.json({ error: "This card does not collect RSVPs" }, { status: 400 });
    }

    const { name, response, guest_count, note } = parseResult.data;

    const rsvp = await addRSVP(
      cardId,
      sanitizeText(name, 150),
      response,
      guest_count,
      note ? sanitizeText(note, 500) : null
    );

    return NextResponse.json({ rsvp }, { status: 201 });
  } catch (err) {
    console.error("API rsvps POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
