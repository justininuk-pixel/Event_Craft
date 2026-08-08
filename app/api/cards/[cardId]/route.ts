import { NextRequest, NextResponse } from "next/server";
import { getCard, incrementViews, toPublicCard, toLockedCard } from "../../../../lib/db/cards";
import { supabase } from "../../../../lib/db/client";
import { isAdminRequest, timingSafeEqual } from "../../../../lib/utils/auth";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Passcode-protected cards expose only a stub here. The real content is served by
    // /verify-password after the passcode checks out, otherwise this endpoint is an
    // unauthenticated way around the gate.
    const payload = card.password_hash ? toLockedCard(card) : toPublicCard(card);

    return NextResponse.json({ card: payload });
  } catch (err) {
    console.error("API GET card error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    await incrementViews(cardId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API PATCH card error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId && !secret) {
      return NextResponse.json({ error: "Missing identity credentials" }, { status: 400 });
    }

    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    let isAuthorized = false;

    // Check 1: creator secret match, compared in constant time so response timing can't be
    // used to recover the secret.
    if (secret && card.creator_secret && timingSafeEqual(card.creator_secret, secret)) {
      isAuthorized = true;
    }

    // Check 2: owner match.
    if (!isAuthorized && userId && card.user_id && card.user_id === userId) {
      isAuthorized = true;
    }

    // Check 3: admin. Previously an unauthenticated `?userId=<any admin id>` was enough to
    // delete any card, since is_admin was looked up from an id supplied in the query string.
    // Admin deletion now requires a verified Supabase access token.
    if (!isAuthorized) {
      isAuthorized = await isAdminRequest(req);
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized to delete this card" }, { status: 403 });
    }

    const { error } = await supabase.from("cards").delete().eq("id", cardId);

    if (error) {
      console.error("Error deleting card:", error);
      return NextResponse.json({ error: "Failed to delete card" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API DELETE card error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
