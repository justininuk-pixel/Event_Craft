import type { NextRequest } from "next/server";
import { supabase } from "../db/client";

/** Length-safe constant-time string comparison, for secrets and tokens. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Extracts a bearer token from the Authorization header, if present. */
export function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

/**
 * Resolves the caller's *verified* user id from their Supabase access token.
 *
 * This is the only trustworthy source of identity in this app. A `userId` query parameter or
 * body field is self-asserted, for anonymous visitors it is literally a value they generated
 * in localStorage, so it must never gate access to anything that isn't already public.
 */
export async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

/**
 * True only when the request carries a valid Supabase access token whose profile is
 * flagged `is_admin`.
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return false;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle();

    return !!profile?.is_admin;
  } catch {
    return false;
  }
}
