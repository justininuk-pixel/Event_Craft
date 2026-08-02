import { supabase } from "../db/client";
import crypto from "crypto";

interface RateLimitConfig {
  endpoint: string;
  windowMs: number;
  maxRequests: number;
}

export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  try {
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const now = Date.now();
    const windowStart = new Date(now - config.windowMs);

    // Call cleanup occasionally to prevent database bloat
    if (Math.random() < 0.05) {
      supabase.rpc("cleanup_rate_limits").then(({ error }) => {
        if (error) console.error("Failed to run rate limits cleanup:", error);
      });
    }

    // 1. Get count of matching records in the sliding window
    const { count, error } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .eq("endpoint", config.endpoint)
      .gte("created_at", windowStart.toISOString());

    if (error) {
      console.error("Rate limit query error:", error);
      // Fallback: fail open if database has issues, so users aren't locked out
      return { allowed: true, remaining: 1, resetAt: new Date(now + config.windowMs) };
    }

    const currentCount = count || 0;
    const allowed = currentCount < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0));
    const resetAt = new Date(now + config.windowMs);

    if (allowed) {
      // 2. Insert new record
      const { error: insertError } = await supabase
        .from("rate_limits")
        .insert({
          ip_hash: ipHash,
          endpoint: config.endpoint,
        });

      if (insertError) {
        console.error("Failed to record rate limit entry:", insertError);
      }
    }

    return { allowed, remaining, resetAt };
  } catch (err) {
    console.error("Rate limit check general error:", err);
    return { allowed: true, remaining: 1, resetAt: new Date() };
  }
}
