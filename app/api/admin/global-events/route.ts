import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";

// Helper function to check if a user is an admin
async function checkAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error || !profile) return false;
  return profile.is_admin;
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, month, day, rule } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
    }

    // Insert new global event
    const { data, error } = await supabase
      .from("global_events")
      .insert({
        title,
        month: month !== undefined && month !== null ? Number(month) : null,
        day: day !== undefined && day !== null ? Number(day) : null,
        rule: rule || null
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert global event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("API admin global-events POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    if (!userId || !(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing global event ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("global_events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete global event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API admin global-events DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
