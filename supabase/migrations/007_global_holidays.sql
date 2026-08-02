-- 1. Create global_events table
create table if not exists public.global_events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    month integer, -- 1-12 (null if rule is used)
    day integer, -- 1-31 (null if rule is used)
    rule text, -- e.g. 'Second Sunday in May' (null if fixed date is used)
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Grant permissions
grant all privileges on table public.global_events to postgres, service_role;
grant select on table public.global_events to anon, authenticated;
grant insert, update, delete on table public.global_events to authenticated;

-- Enable RLS
alter table public.global_events enable row level security;

-- Policies
drop policy if exists "Allow public read access to global_events" on public.global_events;
create policy "Allow public read access to global_events" on public.global_events for select using (true);

-- Admin write access (we check is_admin from profiles table)
drop policy if exists "Allow admins to write global_events" on public.global_events;
create policy "Allow admins to write global_events" on public.global_events 
  for all using (
    exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- 2. Seed international holidays
insert into public.global_events (title, month, day, rule) values
('New Year''s Day', 1, 1, null),
('Valentine''s Day', 2, 14, null),
('International Women''s Day', 3, 8, null),
('Saint Patrick''s Day', 3, 17, null),
('World Water Day', 3, 22, null),
('April Fools'' Day', 4, 1, null),
('Earth Day', 4, 22, null),
('International Workers'' Day', 5, 1, null),
('Mother''s Day', null, null, 'Second Sunday in May'),
('World Environment Day', 6, 5, null),
('Father''s Day', null, null, 'Third Sunday in June'),
('World Music Day', 6, 21, null),
('International Day of Friendship', 7, 30, null),
('International Youth Day', 8, 12, null),
('International Day of Peace', 9, 21, null),
('Halloween', 10, 31, null),
('Remembrance Day', 11, 11, null),
('Thanksgiving', null, null, 'Fourth Thursday of November'),
('World AIDS Day', 12, 1, null),
('Christmas Day', 12, 25, null),
('New Year''s Eve', 12, 31, null)
on conflict do nothing;
