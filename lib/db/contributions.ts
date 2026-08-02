import { supabase } from "./client";
import { Contribution } from "../themes/types";

export async function addContribution(
  cardId: string,
  displayName: string,
  message: string,
  signature?: string | null,
  photoUrl?: string | null,
  voiceUrl?: string | null
): Promise<Contribution> {
  const { data, error } = await supabase
    .from("contributions")
    .insert({
      card_id: cardId,
      display_name: displayName,
      message,
      signature: signature || null,
      photo_url: photoUrl || null,
      voice_url: voiceUrl || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add contribution: ${error.message}`);
  }

  return data as Contribution;
}

export async function deleteContribution(cardId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from("contributions")
    .delete()
    .eq("id", id)
    .eq("card_id", cardId);
  if (error) throw new Error(`Failed to delete contribution: ${error.message}`);
}

export async function updateContribution(
  cardId: string,
  id: string,
  fields: { status?: string; sort_order?: number }
): Promise<void> {
  const { error } = await supabase
    .from("contributions")
    .update(fields)
    .eq("id", id)
    .eq("card_id", cardId);
  if (error) throw new Error(`Failed to update contribution: ${error.message}`);
}

export async function getContributions(cardId: string): Promise<Contribution[]> {
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("card_id", cardId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch contributions: ${error.message}`);
  }

  return data as Contribution[];
}
