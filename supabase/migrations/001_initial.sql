-- 1. Create Extensions
create extension if not exists "uuid-ossp";

-- 2. Create Cards Table
create table if not exists public.cards (
    id text primary key, -- nanoid(8)
    theme_id text not null,
    config jsonb not null default '{}'::jsonb,
    delivery_style text not null default 'envelope',
    audio_preset text not null default 'silence',
    is_collaborative boolean not null default false,
    max_contributors integer not null default 10,
    collab_password text, -- optional password to protect adding contributions
    scheduled_at timestamp with time zone,
    password_hash text, -- optional password to protect viewing card
    has_rsvp boolean not null default false,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    expires_at timestamp with time zone not null default (timezone('utc'::text, now()) + interval '90 days'),
    view_count integer not null default 0,
    creator_ip_hash text not null
);

-- 3. Create Reactions Table
create table if not exists public.reactions (
    id uuid primary key default gen_random_uuid(),
    card_id text not null references public.cards(id) on delete cascade,
    emoji text not null,
    message text,
    display_name text,
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- 4. Create Contributions Table (For Group Collaborative Cards)
create table if not exists public.contributions (
    id uuid primary key default gen_random_uuid(),
    card_id text not null references public.cards(id) on delete cascade,
    display_name text not null,
    message text not null,
    signature text, -- base64 SVG or canvas path data
    photo_url text, -- Supabase Storage URL
    voice_url text, -- Supabase Storage URL
    sort_order integer not null default 0,
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- 5. Create RSVPs Table (For Invitations)
create table if not exists public.rsvps (
    id uuid primary key default gen_random_uuid(),
    card_id text not null references public.cards(id) on delete cascade,
    name text not null,
    response text not null check (response in ('yes', 'no', 'maybe')),
    guest_count integer not null default 1,
    note text,
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- 6. Create Indexes
create index if not exists cards_theme_id_idx on public.cards(theme_id);
create index if not exists cards_expires_at_idx on public.cards(expires_at);
create index if not exists cards_scheduled_at_idx on public.cards(scheduled_at);
create index if not exists reactions_card_id_idx on public.reactions(card_id);
create index if not exists contributions_card_id_idx on public.contributions(card_id);
create index if not exists rsvps_card_id_idx on public.rsvps(card_id);

-- 7. Enable Row Level Security (RLS)
alter table public.cards enable row level security;
alter table public.reactions enable row level security;
alter table public.contributions enable row level security;
alter table public.rsvps enable row level security;

-- 8. Create RLS Policies
-- Public Read Access to cards
drop policy if exists "Allow public read access to cards" on public.cards;
create policy "Allow public read access to cards"
on public.cards for select
using (true);

-- Public Insert Access to cards
drop policy if exists "Allow public insert access to cards" on public.cards;
create policy "Allow public insert access to cards"
on public.cards for insert
with check (true);

-- Public Update Access to cards
drop policy if exists "Allow public update access to cards" on public.cards;
create policy "Allow public update access to cards"
on public.cards for update
using (true);

-- Public Read Access to reactions
drop policy if exists "Allow public read access to reactions" on public.reactions;
create policy "Allow public read access to reactions"
on public.reactions for select
using (true);

-- Public Insert Access to reactions
drop policy if exists "Allow public insert access to reactions" on public.reactions;
create policy "Allow public insert access to reactions"
on public.reactions for insert
with check (true);

-- Public Read Access to contributions
drop policy if exists "Allow public read access to contributions" on public.contributions;
create policy "Allow public read access to contributions"
on public.contributions for select
using (true);

-- Public Insert Access to contributions
drop policy if exists "Allow public insert access to contributions" on public.contributions;
create policy "Allow public insert access to contributions"
on public.contributions for insert
with check (true);

-- Public Read Access to RSVPs
drop policy if exists "Allow public read access to rsvps" on public.rsvps;
create policy "Allow public read access to rsvps"
on public.rsvps for select
using (true);

-- Public Insert Access to RSVPs
drop policy if exists "Allow public insert access to rsvps" on public.rsvps;
create policy "Allow public insert access to rsvps"
on public.rsvps for insert
with check (true);

-- 9. Create RPC Functions
-- Function to safely increment view count
create or replace function public.increment_view_count(target_card_id text)
returns void as $$
begin
  update public.cards
  set view_count = view_count + 1
  where id = target_card_id;
end;
$$ language plpgsql security definer;

-- Function to get a summary of reactions for a card
create or replace function public.get_reaction_summary(target_card_id text)
returns table (emoji text, count bigint) as $$
begin
  return query
  select r.emoji, count(*) as count
  from public.reactions r
  where r.card_id = target_card_id
  group by r.emoji;
end;
$$ language plpgsql security definer;
