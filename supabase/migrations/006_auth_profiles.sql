-- 1. Create Profiles Table linked to auth.users
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    is_admin boolean not null default false,
    is_pro boolean not null default false,
    created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Grant permissions
grant all privileges on table public.profiles to postgres, service_role;
grant select, update on table public.profiles to anon, authenticated;

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
drop policy if exists "Allow public read access to profiles" on public.profiles;
create policy "Allow public read access to profiles" on public.profiles for select using (true);

drop policy if exists "Allow owners to update their own profile" on public.profiles;
create policy "Allow owners to update their own profile" on public.profiles for update using (auth.uid() = id);

-- 2. Create Trigger Function to automatically insert profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_admin, is_pro)
  values (new.id, new.email, false, false);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
