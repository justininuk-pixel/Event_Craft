import { NextRequest, NextResponse } from "next/server";
import { addRSVP, getRSVPs } from "@/lib/db/rsvps";
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

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const rsvps = await getRSVPs(cardId);
    return NextResponse.json({ rsvps });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const body = await req.json();

    const parseResult = rsvpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.format() }, { status: 400 });
    }

    const { name, response, guest_count, note } = parseResult.data;

    const rsvp = await addRSVP(
      cardId,
      name,
      response,
      guest_count,
      note
    );

    return NextResponse.json({ rsvp }, { status: 201 });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
