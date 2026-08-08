import { supabase } from "../db/client";
import crypto from "crypto";

interface RateLimitConfig {
  endpoint: string;
  windowMs: number;
  maxRequests: number;
}

/**
 * Sliding-window rate limit backed by the `rate_limits` table.
 *
 * The attempt is recorded BEFORE the window is counted. The original order (count, then insert
 * only if allowed) is a check-then-act race: N concurrent requests all read the same
 * pre-insert count and all pass. Inserting first means every attempt is counted exactly once,
 * so concurrent callers see each other and the limit actually holds.
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now();
  const resetAt = new Date(now + config.windowMs);

  try {
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const windowStart = new Date(now - config.windowMs);

    // Opportunistic cleanup to keep the table from growing without bound.
    if (Math.random() < 0.05) {
      void supabase.rpc("cleanup_rate_limits").then(({ error }) => {
        if (error) console.error("Failed to run rate limits cleanup:", error);
      });
    }

    // 1. Record this attempt first, so concurrent requests cannot all slip through.
    const { error: insertError } = await supabase.from("rate_limits").insert({
      ip_hash: ipHash,
      endpoint: config.endpoint,
    });

    if (insertError) {
      console.error("Failed to record rate limit entry:", insertError);
      // This request can't be accounted for, fail open rather than locking everyone out.
      return { allowed: true, remaining: 1, resetAt };
    }

    // 2. Count attempts in the window, including the one just inserted.
    const { count, error } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("endpoint", config.endpoint)
      .gte("created_at", windowStart.toISOString());

    if (error) {
      console.error("Rate limit query error:", error);
      return { allowed: true, remaining: 1, resetAt };
    }

    const currentCount = count ?? 0;
    const allowed = currentCount <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - currentCount);

    return { allowed, remaining, resetAt };
  } catch (err) {
    console.error("Rate limit check general error:", err);
    return { allowed: true, remaining: 1, resetAt };
  }
}
