-- =============================================================================
-- 011_lockdown_rls.sql — close direct anon access to card data
-- =============================================================================
--
-- WHY THIS EXISTS
--
-- NEXT_PUBLIC_SUPABASE_ANON_KEY ships inside the client JavaScript bundle: it is public by
-- construction. Migrations 001/002 combined `GRANT ALL PRIVILEGES ... TO anon` with
-- `USING (true)` policies on public.cards, so anyone who opened the site could read the anon
-- key out of the bundle and then query the cards table directly over PostgREST, retrieving
-- for EVERY card:
--
--   * creator_secret  — the bearer credential for the analytics dashboard, card deletion and
--                       contribution moderation
--   * password_hash / collab_password — bcrypt hashes of the passcodes
--   * creator_ip_hash — the creator's IP address (stored in plaintext before this release)
--   * config          — the full private contents of every "passcode protected" card
--
-- `FOR UPDATE USING (true)` additionally let anyone rewrite any card.
--
-- No application code reads these tables with the anon key: every read and write goes through
-- a Next.js route handler that uses SUPABASE_SERVICE_ROLE_KEY (which bypasses RLS by design).
-- So anon/authenticated need no direct access at all, with one exception noted below.
--
-- Apply with: supabase db push   (or paste into the SQL editor)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- cards: no direct client access whatsoever.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to cards"   on public.cards;
drop policy if exists "Allow public insert access to cards" on public.cards;
drop policy if exists "Allow public update access to cards" on public.cards;

revoke all privileges on table public.cards from anon, authenticated;

alter table public.cards enable row level security;

-- -----------------------------------------------------------------------------
-- reactions: written and read only through /api/cards/[cardId]/reactions.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to reactions"   on public.reactions;
drop policy if exists "Allow public insert access to reactions" on public.reactions;

revoke all privileges on table public.reactions from anon, authenticated;

alter table public.reactions enable row level security;

-- -----------------------------------------------------------------------------
-- rsvps: guest names, party sizes and notes. Personal data, service role only.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to rsvps"   on public.rsvps;
drop policy if exists "Allow public insert access to rsvps" on public.rsvps;

revoke all privileges on table public.rsvps from anon, authenticated;

alter table public.rsvps enable row level security;

-- -----------------------------------------------------------------------------
-- contributions: the ONE exception.
--
-- lib/hooks/useRealtimeContributions.ts subscribes to postgres_changes with the anon client,
-- and Supabase Realtime evaluates RLS as the subscribing role. So anon keeps SELECT — but
-- only for contributions belonging to a card that is not passcode protected, otherwise the
-- realtime stream would hand out the contents of a locked card.
--
-- Writes still go through the API (which validates, rate limits and enforces the contributor
-- cap), so INSERT/UPDATE/DELETE are revoked.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to contributions"   on public.contributions;
drop policy if exists "Allow public insert access to contributions" on public.contributions;

revoke all privileges on table public.contributions from anon, authenticated;
grant select on table public.contributions to anon, authenticated;

alter table public.contributions enable row level security;

drop policy if exists "Read contributions of unlocked cards" on public.contributions;
create policy "Read contributions of unlocked cards"
on public.contributions for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cards c
    where c.id = contributions.card_id
      and c.password_hash is null
  )
);

-- -----------------------------------------------------------------------------
-- calendar_events: a user's own events only.
--
-- 005 created public read/insert/update/delete policies and 009 granted ALL to anon, so any
-- visitor could read, edit or delete every user's calendar. Registered users are now scoped
-- to their own rows via auth.uid(); anonymous guest rows (user_id like 'anon_%') stay
-- reachable because the guest flow has no server-side identity to check against — the app
-- writes them through /api/cards/calendar, which validates input and pins the owner to the
-- session when there is one.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to calendar_events"   on public.calendar_events;
drop policy if exists "Allow public insert access to calendar_events" on public.calendar_events;
drop policy if exists "Allow public update access to calendar_events" on public.calendar_events;
drop policy if exists "Allow public delete access to calendar_events" on public.calendar_events;

revoke all privileges on table public.calendar_events from anon, authenticated;
grant select, insert, update, delete on table public.calendar_events to anon, authenticated;

alter table public.calendar_events enable row level security;

drop policy if exists "Owners manage their calendar events" on public.calendar_events;
create policy "Owners manage their calendar events"
on public.calendar_events for all
to anon, authenticated
using (
  user_id = coalesce(auth.uid()::text, user_id) and
  (auth.uid() is not null or user_id like 'anon\_%')
)
with check (
  user_id = coalesce(auth.uid()::text, user_id) and
  (auth.uid() is not null or user_id like 'anon\_%')
);

-- -----------------------------------------------------------------------------
-- theme_interactions: likes/bookmarks. Written through /api/themes/interactions with the
-- service role, and mirrored in localStorage client-side, so anon needs no direct access.
-- The previous FOR DELETE / FOR UPDATE USING (true) policies let anyone wipe anyone's likes.
-- -----------------------------------------------------------------------------
drop policy if exists "Public insert theme_interactions" on public.theme_interactions;
drop policy if exists "Public update theme_interactions" on public.theme_interactions;
drop policy if exists "Public delete theme_interactions" on public.theme_interactions;

revoke insert, update, delete on table public.theme_interactions from anon, authenticated;

-- -----------------------------------------------------------------------------
-- profiles: is_admin / is_pro must never be writable from the client.
--
-- 006 granted `select, update` to anon with `for select using (true)`, so every profile row
-- (including email) was world-readable with the public anon key, and the UPDATE grant put the
-- role columns one PostgREST call away from any visitor.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to profiles" on public.profiles;
drop policy if exists "Allow owners to update their own profile" on public.profiles;

revoke all privileges on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

alter table public.profiles enable row level security;

drop policy if exists "Users read their own profile" on public.profiles;
create policy "Users read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- -----------------------------------------------------------------------------
-- saved_themes: bookmarks. 005 gave every visitor read/insert/delete on all rows.
-- Reads and writes go through the API, so no direct client access is needed.
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to saved_themes"   on public.saved_themes;
drop policy if exists "Allow public insert access to saved_themes" on public.saved_themes;
drop policy if exists "Allow public delete access to saved_themes" on public.saved_themes;

revoke all privileges on table public.saved_themes from anon, authenticated;

alter table public.saved_themes enable row level security;

-- -----------------------------------------------------------------------------
-- global_events: read-only reference data. 007 additionally granted
-- insert/update/delete to `authenticated`, which let any signed-in user edit the shared
-- holiday list; writes belong to /api/admin/global-events (service role + admin check).
-- -----------------------------------------------------------------------------
drop policy if exists "Allow public read access to global_events" on public.global_events;
drop policy if exists "Allow admins to write global_events" on public.global_events;

revoke all privileges on table public.global_events from anon, authenticated;
grant select on table public.global_events to anon, authenticated;

alter table public.global_events enable row level security;

drop policy if exists "Public read global_events" on public.global_events;
create policy "Public read global_events"
on public.global_events for select
to anon, authenticated
using (true);
