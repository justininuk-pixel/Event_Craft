-- ============================================================================
-- 20260628_group_card_collab.sql
-- Group-card collaboration overhaul:
--   1. Enable Supabase Realtime on the contributions table so the viewer and
--      contributor pages update live as people add their messages.
--   2. Add columns for moderation/identity (status, contributor_token, color).
-- Idempotent: safe to re-run. The app degrades gracefully (polls every 12s)
-- until this migration is applied.
-- ============================================================================

-- Moderation + identity columns
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS contributor_token TEXT;
ALTER TABLE public.contributions ADD COLUMN IF NOT EXISTS color TEXT;

-- Add contributions to the realtime publication (guarded so re-running is safe).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'contributions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contributions;
  END IF;
END $$;

-- Ensure DELETE events carry the old row id to realtime subscribers.
ALTER TABLE public.contributions REPLICA IDENTITY FULL;
