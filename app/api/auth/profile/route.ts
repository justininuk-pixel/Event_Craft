import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";
import { getAuthenticatedUserId, isAdminRequest } from "../../../../lib/utils/auth";

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

    // Only the flags the UI needs. `select("*")` returned the whole profile row (email and any
    // other columns) to anyone who could guess or observe a user id.
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, is_admin, is_pro")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
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

/**
 * Role changes (is_admin / is_pro).
 *
 * This route previously took `userId`, `is_admin` and `is_pro` straight from the request body
 * with no authentication at all, so a single unauthenticated POST could make any account an
 * administrator. Now:
 *   - the caller must present a valid Supabase access token,
 *   - `is_admin` may only be changed by an existing admin (no self-escalation),
 *   - `is_pro` may be changed on your own account (the in-app upgrade flow) or by an admin.
 */
export async function POST(req: NextRequest) {
  try {
    const callerId = await getAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { error: "You must be signed in to change account roles." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { userId, is_admin, is_pro } = body as {
      userId?: unknown;
      is_admin?: unknown;
      is_pro?: unknown;
    };

    if (typeof userId !== "string" || !userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    if (userId.startsWith("anon_")) {
      return NextResponse.json(
        { error: "Anonymous guest users cannot have persistent database roles. Please Sign Up first!" },
        { status: 400 }
      );
    }

    const callerIsAdmin = await isAdminRequest(req);
    const isSelf = userId === callerId;

    // Granting/revoking admin is the privilege-escalation path, admins only, never self-serve.
    if (is_admin !== undefined && !callerIsAdmin) {
      return NextResponse.json(
        { error: "Admin privileges are required to change the admin role." },
        { status: 403 }
      );
    }

    // Everything else must at least target your own account.
    if (!isSelf && !callerIsAdmin) {
      return NextResponse.json(
        { error: "You can only change your own account." },
        { status: 403 }
      );
    }

    // Only include fields that were actually supplied, an explicit `undefined` in a Supabase
    // update object is serialised rather than skipped, which would blank the other column.
    const updates: { is_admin?: boolean; is_pro?: boolean } = {};
    if (is_admin !== undefined) updates.is_admin = !!is_admin;
    if (is_pro !== undefined) updates.is_pro = !!is_pro;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("id, is_admin, is_pro")
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("API POST profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
