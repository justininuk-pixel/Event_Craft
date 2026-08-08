import { supabase } from "./client";
import { SavedCard, CardConfig } from "../themes/types";

/**
 * Strip every creator-only / private field before a card row is sent to a browser.
 *
 * `creator_secret` is the bearer credential for deleting the card, reading its analytics
 * dashboard and moderating contributions, and `creator_ip_hash` holds the creator's IP.
 * Both come back from `select("*")`, so any route that spreads a card row into a response
 * (or into an RSC payload) leaks them to every recipient of a public card link unless this
 * is applied first.
 */
export function toPublicCard(card: SavedCard): SavedCard {
  const rest = { ...card } as SavedCard & Record<string, unknown>;
  delete rest.creator_secret;
  // creator_ip_hash is not on the SavedCard type but is present on the row from select("*").
  delete rest.creator_ip_hash;

  return {
    ...(rest as SavedCard),
    // Signal that a gate exists without revealing the bcrypt hash itself.
    password_hash: card.password_hash ? "protected" : null,
    collab_password: card.collab_password ? "protected" : null,
  };
}

/**
 * A content-free stub for a passcode-protected card: enough for the viewer to render the
 * passcode gate, and nothing an unauthenticated visitor could read the card from.
 */
export function toLockedCard(card: SavedCard): SavedCard {
  const publicCard = toPublicCard(card);

  return {
    ...publicCard,
    theme_id: card.theme_id,
    config: {
      // Neutral placeholders, the gate UI itself reads none of these.
      title: "",
      subtitle: "",
      body: "",
      recipient: "",
      sender: "",
      palette: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",
        background: "#0b0b12",
        text: "#ffffff",
        textSecondary: "#a1a1aa",
      },
      fontHeading: "",
      fontBody: "",
      animationSpeed: "normal",
      animationsEnabled: true,
      stickers: [],
      deliveryStyle: card.delivery_style,
      audioPreset: "none",
      audioVolume: 0.5,
      audioAutoplay: false,
    } as unknown as CardConfig,
  };
}

export async function createCard(
  id: string,
  themeId: string,
  config: CardConfig,
  deliveryStyle: string,
  audioPreset: string,
  isCollaborative: boolean,
  maxContributors: number | null,
  collabPassword?: string | null,
  scheduledAt?: string | null,
  passwordHash?: string | null,
  hasRsvp: boolean = false,
  creatorIpHash: string = "",
  creatorSecret: string = "",
  userId?: string | null
): Promise<SavedCard> {
  // Build the full row object
  const fullRow: Record<string, unknown> = {
    id,
    theme_id: themeId,
    config,
    delivery_style: deliveryStyle,
    audio_preset: audioPreset,
    is_collaborative: isCollaborative,
    max_contributors: maxContributors,
    collab_password: collabPassword || null,
    scheduled_at: scheduledAt || null,
    password_hash: passwordHash || null,
    has_rsvp: hasRsvp,
    creator_ip_hash: creatorIpHash,
    creator_secret: creatorSecret,
    user_id: userId || null,
  };

  const { data, error } = await supabase
    .from("cards")
    .insert(fullRow)
    .select()
    .single();

  if (error) {
    // If the error is about a missing column in schema cache, retry without optional columns
    if (error.message?.includes("schema cache") || error.message?.includes("Could not find")) {
      console.warn("createCard: Schema cache issue detected, retrying without optional columns...");
      const safeRow = { ...fullRow };
      // Remove columns that may not exist in the DB yet
      delete safeRow.creator_secret;
      delete safeRow.user_id;
      
      const { data: retryData, error: retryError } = await supabase
        .from("cards")
        .insert(safeRow)
        .select()
        .single();
      
      if (retryError) {
        throw new Error(`Failed to create card: ${retryError.message}`);
      }
      return retryData as SavedCard;
    }
    throw new Error(`Failed to create card: ${error.message}`);
  }

  return data as SavedCard;
}

export async function getCard(id: string): Promise<SavedCard | null> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch card: ${error.message}`);
  }

  return data as SavedCard;
}

/**
 * Fire-and-forget: bump a theme's usage counter when a card is published.
 * No-ops gracefully if the theme_analytics migration hasn't been run yet.
 */
export async function incrementThemeUsage(themeId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("increment_theme_usage", {
      target_theme_id: themeId,
    });
    if (error) console.warn("Theme usage increment skipped:", error.message);
  } catch (err) {
    console.warn("Theme usage increment skipped:", err);
  }
}

/** Returns a map of theme_id → use_count. Empty if analytics aren't set up. */
export async function getThemeUsage(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.from("theme_usage").select("theme_id, use_count");
    if (error || !data) return {};
    return Object.fromEntries(
      data.map((row: { theme_id: string; use_count: number }) => [row.theme_id, row.use_count])
    );
  } catch {
    return {};
  }
}

export async function incrementViews(id: string): Promise<void> {
  const { error } = await supabase.rpc("increment_view_count", {
    target_card_id: id,
  });

  if (error) {
    console.error(`Failed to increment view count: ${error.message}`);
  }
}

export async function getCardWithSecret(id: string, secret: string): Promise<SavedCard | null> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .eq("creator_secret", secret)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch card with secret: ${error.message}`);
  }

  return data as SavedCard;
}
