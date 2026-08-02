-- ============================================================================
-- 20260630_theme_interactions.sql
-- Per-user theme likes / bookmarks / views. Powers the Netflix-style personalized
-- recommendations on the home page and the working like + bookmark buttons.
--
-- The app degrades gracefully until this runs: the client keeps a localStorage
-- mirror, and the API routes no-op on a missing table. Running this migration turns
-- on cross-device sync and server-side personalization.
--
-- Safe/idempotent: re-running will not error.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.theme_interactions (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    TEXT NOT NULL,                 -- anon_* id or authenticated user id
  theme_id   TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('like', 'bookmark', 'view')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, theme_id, type)
);

CREATE INDEX IF NOT EXISTS idx_theme_interactions_user ON public.theme_interactions (user_id, type);
CREATE INDEX IF NOT EXISTS idx_theme_interactions_theme ON public.theme_interactions (theme_id, type);

ALTER TABLE public.theme_interactions ENABLE ROW LEVEL SECURITY;

-- This app is anonymous-first (user_id is a client-generated id, same model as cards).
-- Allow read/write so anon users can like/bookmark; the API also runs with the service
-- role server-side. Tighten later if real auth is introduced.
DROP POLICY IF EXISTS "Public read theme_interactions" ON public.theme_interactions;
CREATE POLICY "Public read theme_interactions" ON public.theme_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert theme_interactions" ON public.theme_interactions;
CREATE POLICY "Public insert theme_interactions" ON public.theme_interactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update theme_interactions" ON public.theme_interactions;
CREATE POLICY "Public update theme_interactions" ON public.theme_interactions FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete theme_interactions" ON public.theme_interactions;
CREATE POLICY "Public delete theme_interactions" ON public.theme_interactions FOR DELETE USING (true);
