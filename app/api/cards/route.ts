import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createCard, incrementThemeUsage, toPublicCard } from "../../../lib/db/cards";
import { validateCardConfig, sanitizeText } from "../../../lib/utils/validation";
import { CreateCardSchema } from "../../../lib/db/schemas";
import { getThemeById } from "../../../lib/themes/registry";
import { nanoid } from "nanoid";
import { supabase } from "../../../lib/db/client";
import { checkRateLimit } from "../../../lib/utils/rate-limit";
import { getClientIp } from "../../../lib/utils/request";
import { getAuthenticatedUserId } from "../../../lib/utils/auth";

import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const ip = getClientIp(req);

    // Rate limit before doing any real work (bcrypt hashing below is deliberately expensive).
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

    // 1. Validate the whole request, not just `config`. CreateCardSchema already existed but
    //    was never applied, so scheduledAt/maxContributors/password arrived unchecked.
    const parsed = CreateCardSchema.safeParse(rawBody);
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      return NextResponse.json({ error: `Validation error: ${message}` }, { status: 400 });
    }

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
    } = parsed.data;

    // 2. Verify Theme ID exists
    const theme = getThemeById(themeId);
    if (!theme) {
      return NextResponse.json({ error: "Invalid theme ID" }, { status: 400 });
    }

    // 3. Validate + sanitize the card configuration
    const validation = validateCardConfig(config);
    if (!validation.success) {
      return NextResponse.json({ error: `Validation error: ${validation.error}` }, { status: 400 });
    }

    const cleanConfig = validation.data!;
    cleanConfig.title = sanitizeText(cleanConfig.title, 200);
    // These are optional, sanitizeText turns undefined into "", which would persist an empty
    // string where the field was simply absent. Only rewrite what was actually provided.
    if (cleanConfig.subtitle !== undefined) cleanConfig.subtitle = sanitizeText(cleanConfig.subtitle, 200);
    if (cleanConfig.body !== undefined) cleanConfig.body = sanitizeText(cleanConfig.body, 2000);
    cleanConfig.recipient = sanitizeText(cleanConfig.recipient, 100);
    cleanConfig.sender = sanitizeText(cleanConfig.sender, 100);

    if (!cleanConfig.recipient || !cleanConfig.sender) {
      return NextResponse.json(
        { error: "Recipient and sender are required" },
        { status: 400 }
      );
    }

    // Reject a scheduled date we can't parse, rather than storing garbage that breaks the
    // countdown gate on the viewer.
    if (scheduledAt && Number.isNaN(Date.parse(scheduledAt))) {
      return NextResponse.json({ error: "scheduledAt is not a valid date" }, { status: 400 });
    }

    const cardId = nanoid(12);
    const creatorSecret = nanoid(32);

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
    const hashedCollabPassword = collabPassword ? bcrypt.hashSync(collabPassword, 10) : null;

    // Ownership: prefer the verified session. Anonymous visitors are still allowed to own
    // cards via their local `anon_*` id (that's the product's guest flow), but a caller can no
    // longer file a card under someone else's real account by passing an arbitrary user_id,
    // which is what reading `body.userId` unconditionally allowed.
    const sessionUserId = await getAuthenticatedUserId(req);
    const claimedUserId = typeof (rawBody as { userId?: unknown }).userId === "string"
      ? ((rawBody as { userId: string }).userId)
      : null;
    const ownerId =
      sessionUserId ?? (claimedUserId?.startsWith("anon_") ? claimedUserId.slice(0, 64) : null);

    // The column is named creator_ip_hash but the raw client IP was being stored in it.
    // Hash it so the table doesn't hold plaintext IP addresses.
    const creatorIpHash = crypto.createHash("sha256").update(ip).digest("hex");

    await createCard(
      cardId,
      themeId,
      cleanConfig,
      deliveryStyle || "envelope",
      audioPreset || "silence",
      !!isCollaborative,
      maxContributors ?? 20,
      hashedCollabPassword,
      scheduledAt || null,
      hashedPassword,
      !!hasRsvp,
      creatorIpHash,
      creatorSecret,
      ownerId
    );

    // Fire-and-forget analytics: bump the theme's usage counter (powers trending).
    void incrementThemeUsage(themeId);

    // Prefer the configured base URL. `Host` is attacker-controlled, so deriving share links
    // from it lets a request poison the URL handed back to the creator.
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      const host = req.headers.get("host") || "localhost:3000";
      const proto = req.headers.get("x-forwarded-proto") || "http";
      const scheme = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : proto;
      baseUrl = `${scheme}://${host}`;
    }

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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");
    const collaborative = searchParams.get("collaborative") === "true";

    if (!requestedUserId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // A signed-in caller may only list their own cards, regardless of what the query string
    // asks for. Guests fall back to their local anon id (self-asserted, but it only ever
    // exposes guest-created cards, never a registered account's).
    const sessionUserId = await getAuthenticatedUserId(req);
    const userId = sessionUserId ?? requestedUserId;

    if (!sessionUserId && !requestedUserId.startsWith("anon_")) {
      return NextResponse.json(
        { error: "Sign in to list cards for a registered account." },
        { status: 401 }
      );
    }

    // Note: `.eq()` is parameterised. The previous development-only branch interpolated the
    // id into a PostgREST `.or()` filter string, which is injectable (a value containing a
    // comma or a dotted operator rewrites the filter).
    let query = supabase.from("cards").select("*").eq("user_id", userId);

    if (collaborative) {
      query = query.eq("is_collaborative", true);
    }

    const { data: cards, error: err } = await query.order("created_at", { ascending: false });

    if (err) {
      console.error("Database query error:", err);
      return NextResponse.json({ error: "Failed to load cards" }, { status: 500 });
    }

    // Strip creator_secret / creator_ip_hash before the list reaches the browser.
    return NextResponse.json((cards || []).map(toPublicCard));
  } catch (err) {
    console.error("API GET cards error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

