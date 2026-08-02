-- 1. Alter cards to add missing tracking fields
alter table public.cards add column if not exists shares integer not null default 0;
alter table public.cards add column if not exists user_id text;

-- 2. Create Calendar Events Table
create table if not exists public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    user_id text not null, 
    title text not null,
    event_date timestamp with time zone not null,
    event_type text not null default 'custom', 
    theme_id text, 
    card_id text references public.cards(id) on delete set null,
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists calendar_events_date_idx on public.calendar_events(event_date);

alter table public.calendar_events enable row level security;

create policy "Allow public read access to calendar_events"
on public.calendar_events for select using (true);

create policy "Allow public insert access to calendar_events"
on public.calendar_events for insert with check (true);

create policy "Allow public update access to calendar_events"
on public.calendar_events for update using (true);

create policy "Allow public delete access to calendar_events"
on public.calendar_events for delete using (true);

-- 3. Create Saved Themes (Bookmarks) Table
create table if not exists public.saved_themes (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    theme_id text not null,
    created_at timestamp with time zone not null default timezone('utc'::text, now()),
    unique(user_id, theme_id)
);

create index if not exists saved_themes_user_id_idx on public.saved_themes(user_id);

alter table public.saved_themes enable row level security;

create policy "Allow public read access to saved_themes"
on public.saved_themes for select using (true);

create policy "Allow public insert access to saved_themes"
on public.saved_themes for insert with check (true);

create policy "Allow public delete access to saved_themes"
on public.saved_themes for delete using (true);
