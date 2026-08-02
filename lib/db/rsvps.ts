import { supabase } from "./client";
import { RSVPResponse } from "../themes/types";

export async function addRSVP(
  cardId: string,
  name: string,
  response: "yes" | "no" | "maybe",
  guestCount: number = 1,
  note?: string | null
): Promise<RSVPResponse> {
  const { data, error } = await supabase
    .from("rsvps")
    .insert({
      card_id: cardId,
      name,
      response,
      guest_count: guestCount,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit RSVP: ${error.message}`);
  }

  return data as RSVPResponse;
}

export async function getRSVPs(cardId: string): Promise<RSVPResponse[]> {
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch RSVPs: ${error.message}`);
  }

  return data as RSVPResponse[];
}
