-- ============================================================================
-- 20260627_theme_analytics.sql
-- Theme usage analytics — powers data-driven "Theme Intelligence" (e.g. trending
-- experiences, "most loved" badges). Every published card increments its theme's
-- counter. Safe/idempotent: re-running this migration will not error.
--
-- NOTE: The experience engine itself needs NO schema change — experience content
-- (timeline, layers, puzzle, unlock date), Surprise Mode, Emotional Tone and
-- Dynamic Time all persist inside the existing cards.config JSONB column.
-- This migration only adds optional analytics.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.theme_usage (
  theme_id     TEXT PRIMARY KEY,
  use_count    INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_theme_usage_count ON public.theme_usage (use_count DESC);

ALTER TABLE public.theme_usage ENABLE ROW LEVEL SECURITY;

-- Anyone may read aggregate usage (used to surface trending themes in the gallery).
DROP POLICY IF EXISTS "Public read theme_usage" ON public.theme_usage;
CREATE POLICY "Public read theme_usage" ON public.theme_usage FOR SELECT USING (true);

-- Increment (or create) a theme's usage counter. SECURITY DEFINER lets it write
-- without a public INSERT/UPDATE policy, so clients can only ever read.
CREATE OR REPLACE FUNCTION public.increment_theme_usage(target_theme_id TEXT)
RETURNS VOID AS $$
  INSERT INTO public.theme_usage (theme_id, use_count, last_used_at)
  VALUES (target_theme_id, 1, NOW())
  ON CONFLICT (theme_id)
  DO UPDATE SET
    use_count = public.theme_usage.use_count + 1,
    last_used_at = NOW();
$$ LANGUAGE SQL SECURITY DEFINER;
