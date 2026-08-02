import { supabase } from "./client";
import { Reaction } from "../themes/types";

export async function addReaction(
  cardId: string,
  emoji: string,
  message?: string | null,
  displayName?: string | null
): Promise<Reaction> {
  const { data, error } = await supabase
    .from("reactions")
    .insert({
      card_id: cardId,
      emoji,
      message: message || null,
      display_name: displayName || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add reaction: ${error.message}`);
  }

  return data as Reaction;
}

export async function getReactions(cardId: string): Promise<Reaction[]> {
  const { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reactions: ${error.message}`);
  }

  return data as Reaction[];
}

export async function getReactionSummary(
  cardId: string
): Promise<{ emoji: string; count: number }[]> {
  const { data, error } = await supabase.rpc("get_reaction_summary", {
    target_card_id: cardId,
  });

  if (error) {
    console.error(`Failed to fetch reaction summary: ${error.message}`);
    return [];
  }

  // Supabase RPC returns count as string/bigint, we parse to number
  const typedData = data as { emoji: string; count: string | number }[] | null;
  return (typedData || []).map((r) => ({
    emoji: r.emoji,
    count: typeof r.count === "string" ? parseInt(r.count, 10) : Number(r.count),
  }));
}
