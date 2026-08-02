import { CardConfig } from "../themes/types";
import { CardConfigSchema } from "../db/schemas";

export function sanitizeText(input: string, maxLength: number = 2000): string {
  if (!input) return "";
  const clean = input.replace(/<\/?[^>]+(>|$)/g, "");
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
