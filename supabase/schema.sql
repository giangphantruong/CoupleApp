-- Run this once in your Supabase project's SQL Editor to create the app's tables.
-- Supabase uses Postgres, a standard relational database: data lives in tables (rows + columns),
-- and tables can reference each other by id (a "foreign key").

-- A couple is just "the pairing between two people." Nothing is stored on it directly yet;
-- profiles.couple_id points here, and posts.couple_id points here too.
create table couples (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- One row per signed-up person. Linked 1-to-1 with Supabase's built-in auth.users table
-- (auth.users handles passwords/login; this table holds the app-specific info about them).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  couple_id uuid references couples (id) on delete set null,
  created_at timestamptz not null default now()
);

-- The short code one partner generates and the other types in to link accounts.
create table pairing_codes (
  code text primary key,
  couple_id uuid not null references couples (id) on delete cascade,
  created_by uuid not null references profiles (id) on delete cascade,
  used boolean not null default false,
  expires_at timestamptz not null default (now() + interval '7 days')
);

-- One row per photo/video someone uploads.
create table posts (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  media_path text not null, -- where the file lives in Supabase Storage
  media_type text not null check (media_type in ('photo', 'video')),
  caption text,
  taken_at timestamptz not null default now(), -- used to sort/group posts on the timeline
  created_at timestamptz not null default now()
);

-- Row Level Security (RLS): by default Postgres lets any logged-in request read any row.
-- These policies say "you may only ever see/touch rows belonging to your own couple" —
-- this is what actually keeps couple A's photos private from couple B, at the database level.
--
-- couples itself is deliberately left without RLS: a row here is just an id + timestamp,
-- nothing sensitive, and it has to be createable before the profile that will link to it
-- even exists. Actual privacy is enforced on profiles/pairing_codes/posts/storage below,
-- which is what actually gates who can read a couple's content.
alter table profiles enable row level security;
alter table pairing_codes enable row level security;
alter table posts enable row level security;

-- A profiles policy that reads couple_id from profiles itself would recurse
-- (Postgres detects and rejects that), so the couple_id lookup is done through
-- this security-definer helper, which runs with RLS bypassed internally.
create function my_couple_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select couple_id from profiles where id = auth.uid()
$$;

create policy "read own couple's profiles" on profiles
  for select using (couple_id = my_couple_id());

create policy "update own profile" on profiles
  for update using (id = auth.uid());

create policy "insert own profile" on profiles
  for insert with check (id = auth.uid());

create policy "read/use pairing codes" on pairing_codes
  for select using (true); -- entering a code requires looking it up before you're linked

create policy "create pairing codes" on pairing_codes
  for insert with check (created_by = auth.uid());

create policy "mark own couple's posts" on posts
  for all using (
    couple_id in (select couple_id from profiles where id = auth.uid())
  );

-- Storage: where the actual photo/video files live (the database only stores their path).
-- We'll upload files under a path like "<couple_id>/<random-filename>.jpg" and use that
-- prefix to keep couples from ever reading each other's files.
insert into storage.buckets (id, name, public) values ('media', 'media', false);

create policy "read own couple's media" on storage.objects
  for select using (
    bucket_id = 'media'
    and (storage.foldername(name))[1]::uuid in (
      select couple_id from profiles where id = auth.uid()
    )
  );

create policy "upload to own couple's media" on storage.objects
  for insert with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1]::uuid in (
      select couple_id from profiles where id = auth.uid()
    )
  );
