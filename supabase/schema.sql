-- HerBalance database schema.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Then also run 002_delete_account.sql (lets users delete their own account).
-- Every table is locked down with row-level security (RLS): a signed-in user can only
-- read and write their own rows, and anonymous visitors can't read anything.

-- Profile: everything from onboarding / the Profile page, stored as JSON so new
-- fields don't need a schema change.
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Diet plans: inserted only by the /api/diet-plan server function (which also uses
-- them to enforce the weekly generation limit), so users get read access only.
create table if not exists public.diet_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  duration   int not null check (duration in (7, 14)),
  cuisines   text[] not null default '{}',
  start_date date not null default current_date,
  plan       jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists diet_plans_user_created on public.diet_plans (user_id, created_at desc);

-- Workout log: one row per user per day.
create table if not exists public.workout_logs (
  user_id    uuid not null references auth.users (id) on delete cascade,
  log_date   date not null,
  entries    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

alter table public.profiles     enable row level security;
alter table public.diet_plans   enable row level security;
alter table public.workout_logs enable row level security;

-- profiles: own row only
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles for select using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- diet_plans: read own; insert own (the server inserts with the user's token).
-- No update/delete policy, so the weekly limit can't be reset by deleting rows.
drop policy if exists "own plans select" on public.diet_plans;
drop policy if exists "own plans insert" on public.diet_plans;
create policy "own plans select" on public.diet_plans for select using (auth.uid() = user_id);
create policy "own plans insert" on public.diet_plans for insert with check (auth.uid() = user_id);

-- workout_logs: full control of own rows
drop policy if exists "own logs all" on public.workout_logs;
create policy "own logs all" on public.workout_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
