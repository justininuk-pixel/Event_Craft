import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // If anonymous user, they are not pro and not admin
    if (userId.startsWith("anon_")) {
      return NextResponse.json({
        id: userId,
        email: "Guest User",
        is_admin: false,
        is_pro: false,
      });
    }

    // Query profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      // Fallback if user exists in auth.users but profile trigger hasn't run or completed yet
      return NextResponse.json({
        id: userId,
        email: "User",
        is_admin: false,
        is_pro: false,
      });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("API GET profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, is_admin, is_pro } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    if (userId.startsWith("anon_")) {
      return NextResponse.json({ error: "Anonymous guest users cannot have persistent database roles. Please Sign Up first!" }, { status: 400 });
    }

    // Update profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        is_admin: is_admin !== undefined ? !!is_admin : undefined,
        is_pro: is_pro !== undefined ? !!is_pro : undefined,
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("API POST profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
