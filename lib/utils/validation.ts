import { CardConfig } from "../themes/types";
import { CardConfigSchema } from "../db/schemas";

/**
 * Strips HTML-ish markup from user text and caps its length.
 *
 * A single regex pass is defeatable by nesting, `<<a>script>` becomes `<script>` after one
 * replacement, so the strip is repeated until it reaches a fixed point. React escapes
 * interpolated text anyway, this is defence in depth for the places card text is fed into
 * `renderFormattedText` (which builds an HTML string) and for anything stored and re-served.
 *
 * Also strips control characters, which otherwise survive into stored titles and can break
 * CSV export from the analytics dashboard.
 */
export function sanitizeText(input: string, maxLength: number = 2000): string {
  if (!input) return "";

  let clean = input;
  for (let i = 0; i < 5; i++) {
    const next = clean.replace(/<\/?[^>]*(>|$)/g, "");
    if (next === clean) break;
    clean = next;
  }

  // Keep \n and \t, drop the rest of the C0/C1 control range.
  clean = clean.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  return clean.substring(0, maxLength).trim();
}

export function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export function validateCardConfig(config: unknown): {
  success: boolean;
  error?: string;
  data?: CardConfig;
} {
  const result = CardConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data as CardConfig };
  } else {
    const errorMessage = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return { success: false, error: errorMessage };
  }
}
