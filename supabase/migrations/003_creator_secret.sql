-- Add creator_secret column to public.cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS creator_secret TEXT;
