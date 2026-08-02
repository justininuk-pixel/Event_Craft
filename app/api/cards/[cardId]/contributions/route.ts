import { NextRequest, NextResponse } from "next/server";
import { getContributions, addContribution } from "@/lib/db/contributions";
import { addRSVP } from "@/lib/db/rsvps";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const contributions = await getContributions(cardId);
    return NextResponse.json({ contributions });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const body = await req.json();
    const { type, name, message, signature, photoUrl, voiceUrl, response, guest_count, note } = body;

    // Handle RSVP submission
    if (type === "rsvp") {
      if (!name) {
        return NextResponse.json({ error: "Name is required for RSVP" }, { status: 400 });
      }
      const rsvp = await addRSVP(cardId, name, response || "yes", Number(guest_count || 1), note);
      return NextResponse.json({ success: true, rsvp }, { status: 201 });
    }

    // Handle standard Group Card Contribution
    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    const contribution = await addContribution(cardId, name, message, signature, photoUrl, voiceUrl);
    return NextResponse.json({ success: true, contribution }, { status: 201 });
  } catch (err) {
    console.error("API contributions error:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
