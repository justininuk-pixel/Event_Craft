import { NextRequest, NextResponse } from "next/server";
import { getCardWithSecret } from "@/lib/db/cards";
import { deleteContribution, updateContribution } from "@/lib/db/contributions";

interface RouteParams {
  params: Promise<{ cardId: string; contributionId: string }>;
}

// Only the card creator (holding the creator_secret) may moderate contributions.
async function authorize(cardId: string, secret: string | null): Promise<boolean> {
  if (!secret) return false;
  try {
    const card = await getCardWithSecret(cardId, secret);
    return !!card;
  } catch {
    return false;
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId, contributionId } = await params;
    const secret = new URL(req.url).searchParams.get("secret");
    if (!(await authorize(cardId, secret))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await deleteContribution(cardId, contributionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { cardId, contributionId } = await params;
    const body = await req.json().catch(() => ({}));
    const secret = body.secret || new URL(req.url).searchParams.get("secret");
    if (!(await authorize(cardId, secret))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const fields: { status?: string; sort_order?: number } = {};
    if (body.status === "approved" || body.status === "hidden") fields.status = body.status;
    if (typeof body.sort_order === "number") fields.sort_order = body.sort_order;
    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    await updateContribution(cardId, contributionId, fields);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
