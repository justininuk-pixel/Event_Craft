import type { NextRequest } from "next/server";

/**
 * Best-effort client IP for rate limiting.
 *
 * `x-forwarded-for` is attacker-controlled unless a trusted reverse proxy sets it, so a
 * caller could otherwise send a random value per request and bypass every rate limit. We only
 * honour it when we know a proxy is in front of us (Vercel, or an explicit TRUSTED_PROXY=true),
 * and we take the LAST hop rather than the first: the proxy appends the real peer address, so
 * trailing entries are the ones it controls, while leading entries are client-supplied.
 */
export function getClientIp(req: NextRequest): string {
  const trustProxy = process.env.TRUSTED_PROXY === "true" || process.env.VERCEL === "1";

  if (trustProxy) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      if (hops.length > 0) return hops[hops.length - 1];
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
  }

  // Not behind a known proxy: fall back to a single shared bucket rather than trusting a
  // header. Stricter (all direct callers share a limit) but not forgeable.
  return "untrusted-direct";
}
