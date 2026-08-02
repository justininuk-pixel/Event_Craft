import { NextRequest, NextResponse } from "next/server";
import { getCard, incrementViews } from "../../../../lib/db/cards";
import { supabase } from "../../../../lib/db/client";

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
    const sanitizedCard = {
      ...card,
      password_hash: card.password_hash ? "protected" : null,
      collab_password: card.collab_password ? "protected" : null,
    };
    return NextResponse.json({ card: sanitizedCard });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    await incrementViews(cardId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
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

    // Check 1: creator secret match
    if (secret && card.creator_secret === secret) {
      isAuthorized = true;
    }

    // Check 2: userId match
    if (!isAuthorized && userId && card.user_id === userId) {
      isAuthorized = true;
    }

    // Check 3: admin check
    if (!isAuthorized && userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();
      if (profile && profile.is_admin) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized to delete this card" }, { status: 403 });
    }

    const { error } = await supabase
      .from("cards")
      .delete()
      .eq("id", cardId);

    if (error) {
      console.error("Error deleting card:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
