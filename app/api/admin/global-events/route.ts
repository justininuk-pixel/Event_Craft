import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/db/client";
import { isAdminRequest } from "../../../../lib/utils/auth";

export async function POST(req: NextRequest) {
  try {
    // The admin check used to read the user id from `?userId=`, which is caller-supplied, so
    // knowing (or guessing) any admin's id granted full admin access. Now it requires a
    // verified Supabase access token belonging to an is_admin profile.
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { title, month, day, rule } = body as {
      title?: unknown;
      month?: unknown;
      day?: unknown;
      rule?: unknown;
    };

    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
    }

    // Validate the date parts rather than passing Number() straight through, an out-of-range
    // or NaN month/day silently produced nonsense dates in the calendar.
    const parsedMonth = month === undefined || month === null ? null : Number(month);
    const parsedDay = day === undefined || day === null ? null : Number(day);

    if (parsedMonth !== null && (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12)) {
      return NextResponse.json({ error: "month must be an integer between 1 and 12" }, { status: 400 });
    }
    if (parsedDay !== null && (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31)) {
      return NextResponse.json({ error: "day must be an integer between 1 and 31" }, { status: 400 });
    }
    if ((parsedMonth === null) !== (parsedDay === null)) {
      return NextResponse.json({ error: "month and day must be provided together" }, { status: 400 });
    }
    if (parsedMonth === null && typeof rule !== "string") {
      return NextResponse.json({ error: "Provide either month+day or a recurrence rule" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("global_events")
      .insert({
        title: title.trim().slice(0, 200),
        month: parsedMonth,
        day: parsedDay,
        rule: typeof rule === "string" && rule.trim() ? rule.trim().slice(0, 200) : null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to insert global event:", error);
      return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("API admin global-events POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdminRequest(req))) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing global event ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("global_events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete global event:", error);
      return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API admin global-events DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
