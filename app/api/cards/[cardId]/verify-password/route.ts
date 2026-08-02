import { NextRequest, NextResponse } from "next/server";
import { getCard } from "@/lib/db/cards";
import bcrypt from "bcryptjs";

interface RouteParams {
  params: Promise<{ cardId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId } = await params;
    const body = await req.json();
    const { password, type } = body;

    if (!password || !type) {
      return NextResponse.json({ error: "Missing password or type" }, { status: 400 });
    }

    if (type !== "view" && type !== "collab") {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    const card = await getCard(cardId);
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    let isMatch = false;

    if (type === "view") {
      if (!card.password_hash) {
        // No password set, so any attempt is technically unauthorized or it shouldn't hit this gate
        return NextResponse.json({ success: true });
      }
      isMatch = bcrypt.compareSync(password, card.password_hash);
    } else if (type === "collab") {
      if (!card.collab_password) {
        // No collab password set
        return NextResponse.json({ success: true });
      }
      isMatch = bcrypt.compareSync(password, card.collab_password);
    }

    return NextResponse.json({ success: isMatch });
  } catch (err) {
    console.error("Error in verify-password API:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
