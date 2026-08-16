-- ============================================================
-- ManoVeda Supabase Setup SQL
-- Run this in your Supabase dashboard → SQL Editor
-- ============================================================

-- 1. Profiles table (linked to Supabase Auth)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  gender      text,
  age_range   text,
  role        text default 'student',
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (true);

create policy "Admin can delete profiles"
  on public.profiles for delete
  using (true);

create policy "Admin can delete profiles"
  on public.profiles for delete
  using (true);

-- 2. Instructors table (managed by admin)
create table if not exists public.instructors (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text unique,
  photo_url       text,
  description     text,
  specialization  text,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

alter table public.instructors enable row level security;

-- Anyone (including anon) can read instructors (for booking pages)
create policy "Public read instructors"
  on public.instructors for select
  using (true);

-- Only authenticated users with role = instructor can read their own row
-- Admin operations are done via service_role key (in admin panel we use anon + bypass)
-- For the admin panel with hardcoded credentials, we use a special admin bypass policy:
create policy "Admin can manage instructors"
  on public.instructors for all
  using (true)
  with check (true);

-- 3. Storage bucket for instructor photos
insert into storage.buckets (id, name, public)
  values ('instructor-photos', 'instructor-photos', true)
  on conflict do nothing;

create policy "Public read instructor photos"
  on storage.objects for select
  using (bucket_id = 'instructor-photos');

create policy "Anyone can upload instructor photos"
  on storage.objects for insert
  with check (bucket_id = 'instructor-photos');
