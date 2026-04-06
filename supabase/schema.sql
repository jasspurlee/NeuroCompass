create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'survivor' check (role in ('survivor', 'caregiver')),
  linked_household text not null default 'default-home',
  created_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Medication', 'Appointment', 'Daily task')),
  scheduled_for timestamptz not null,
  completed boolean not null default false,
  created_by text not null default 'survivor',
  household_id text not null default 'default-home',
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  household_id text not null default 'default-home',
  created_at timestamptz not null default now()
);

create table if not exists public.caregiver_invites (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  household_id text not null,
  created_by text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id text not null,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.reminders enable row level security;
alter table public.conversation_notes enable row level security;
alter table public.caregiver_invites enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "profiles_manage_self"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "reminders_shared_access"
on public.reminders
for all
using (household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home'))
with check (household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home'));

create policy "notes_shared_access"
on public.conversation_notes
for all
using (household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home'))
with check (household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home'));

create policy "invites_read_authenticated"
on public.caregiver_invites
for select
using (auth.uid() is not null);

create policy "invites_manage_household"
on public.caregiver_invites
for all
using (household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home'))
with check (household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home'));

create policy "push_subscriptions_shared_access"
on public.push_subscriptions
for all
using (
  user_id = auth.uid()
  or household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home')
)
with check (
  user_id = auth.uid()
  and household_id = coalesce((select linked_household from public.profiles where id = auth.uid()), 'default-home')
);
