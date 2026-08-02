import { NextRequest, NextResponse } from "next/server";
import { createCard, incrementThemeUsage } from "../../../lib/db/cards";
import { validateCardConfig, sanitizeText } from "../../../lib/utils/validation";
import { getThemeById } from "../../../lib/themes/registry";
import { nanoid } from "nanoid";
import { supabase } from "../../../lib/db/client";
import { checkRateLimit } from "../../../lib/utils/rate-limit";

import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const {
      themeId,
      config,
      deliveryStyle,
      audioPreset,
      isCollaborative,
      maxContributors,
      collabPassword,
      scheduledAt,
      password,
      hasRsvp,
      userId,
    } = body;

    // 1. Verify Theme ID exists
    const theme = getThemeById(themeId);
    if (!theme) {
      return NextResponse.json({ error: "Invalid theme ID" }, { status: 400 });
    }

    // 2. Validate Card configuration
    const validation = validateCardConfig(config);
    if (!validation.success) {
      return NextResponse.json({ error: `Validation error: ${validation.error}` }, { status: 400 });
    }

    // Sanitization of inputs inside validated config
    const cleanConfig = validation.data!;
    cleanConfig.title = sanitizeText(cleanConfig.title, 200);
    cleanConfig.subtitle = sanitizeText(cleanConfig.subtitle, 200);
    cleanConfig.body = sanitizeText(cleanConfig.body, 2000);
    cleanConfig.recipient = sanitizeText(cleanConfig.recipient, 100);
    cleanConfig.sender = sanitizeText(cleanConfig.sender, 100);

    // 3. Generate nanoid(8)
    const cardId = nanoid(8);

    // 4. IP check
    const forwardHeader = req.headers.get("x-forwarded-for");
    const ip = forwardHeader ? forwardHeader.split(",")[0] : "127.0.0.1";

    // Rate Limit: Max 5 cards per minute
    const rateCheck = await checkRateLimit(ip, {
      endpoint: "POST /api/cards",
      windowMs: 60_000,
      maxRequests: 5,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // 5. Generate Creator Secret
    const creatorSecret = nanoid(16);

    // Hashing passwords if provided
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
    const hashedCollabPassword = collabPassword ? bcrypt.hashSync(collabPassword, 10) : null;

    // Collaborative group cards are available to everyone (no Pro gate).

    // 6. Save to database
    await createCard(
      cardId,
      themeId,
      cleanConfig,
      deliveryStyle || "envelope",
      audioPreset || "silence",
      !!isCollaborative,
      maxContributors ? Number(maxContributors) : 20,
      hashedCollabPassword,
      scheduledAt || null,
      hashedPassword,
      !!hasRsvp,
      ip,
      creatorSecret,
      userId
    );

    // Fire-and-forget analytics: bump the theme's usage counter (powers trending).
    void incrementThemeUsage(themeId);

    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const scheme = host.includes("localhost") ? "http" : proto;
    const baseUrl = `${scheme}://${host}`;

    const cardUrl = `${baseUrl}/c/${cardId}`;
    const collabUrl = isCollaborative ? `${baseUrl}/collab/${cardId}` : undefined;

    return NextResponse.json(
      {
        id: cardId,
        url: cardUrl,
        collabUrl,
        creatorSecret,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("API POST cards error:", err);
    const errMsg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const collaborative = searchParams.get("collaborative") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    let query = supabase
      .from("cards")
      .select("*");

    if (process.env.NODE_ENV === "development") {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      query = query.eq("user_id", userId);
    }

    if (collaborative) {
      query = query.eq("is_collaborative", true);
    }

    const { data: cards, error: err } = await query.order("created_at", { ascending: false });

    if (err) {
      console.error("Database query error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json(cards || []);
  } catch (err) {
    console.error("API GET cards error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

