-- ============================================================
-- SocialMatch database schema (PostgreSQL / Supabase)
-- Run in Supabase: SQL Editor > New query > paste > Run.
-- Safe to run more than once. Run sample-data.sql afterwards.
-- ============================================================

-- Moods the user can pick. The three "pref_" columns are the ideal
-- noise / crowd / social levels for that mood (used by the match score).
create table if not exists moods (
  id          serial primary key,
  name        text not null unique,
  emoji       text,
  pref_noise  int  not null check (pref_noise  between 1 and 5),
  pref_crowd  int  not null check (pref_crowd  between 1 and 5),
  pref_social int  not null check (pref_social between 1 and 4)
);

-- Places shown on the map. social_level is the interaction level (map color):
-- 1 = Solo, 2 = Low interaction, 3 = Casual social, 4 = Highly interactive.
create table if not exists places (
  id           serial primary key,
  name         text not null,
  lat          double precision not null,
  lng          double precision not null,
  category     text not null,
  noise_level  int  not null check (noise_level  between 1 and 5),
  crowd_level  int  not null check (crowd_level  between 1 and 5),
  social_level int  not null check (social_level between 1 and 4),
  description  text
);

-- Upcoming events, optionally tied to a place.
create table if not exists events (
  id           serial primary key,
  title        text not null,
  lat          double precision not null,
  lng          double precision not null,
  event_date   timestamptz not null,
  category     text not null,
  social_level int  not null check (social_level between 1 and 4),
  place_id     int  references places(id) on delete set null,
  description  text
);

-- Reviews written by users (one place has many reviews).
create table if not exists reviews (
  id         serial primary key,
  place_id   int  not null references places(id) on delete cascade,
  author     text not null,
  rating     int  not null check (rating between 1 and 5),
  body       text,
  created_at timestamptz not null default now()
);

-- Friends shown in the Friends panel (sample contacts). place_id = where they are now.
create table if not exists friends (
  id          serial primary key,
  name        text not null,
  handle      text not null,
  mood        text,
  status_text text,
  place_id    int references places(id) on delete set null
);

-- One profile per browser/device (device_id is generated on first visit).
create table if not exists profiles (
  device_id           text primary key,
  display_name        text not null,
  handle              text,
  bio                 text,
  usual_mood          text,
  favorite_categories text[] not null default '{}',
  share_mood          boolean not null default true,
  updated_at          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security (open policies: fine for a class project).
-- Read-only tables: moods, places, events, friends.
-- Writable from the app: reviews (insert) and profiles (insert/update).
-- ------------------------------------------------------------
alter table moods    enable row level security;
alter table places   enable row level security;
alter table events   enable row level security;
alter table reviews  enable row level security;
alter table friends  enable row level security;
alter table profiles enable row level security;

drop policy if exists "public read moods"      on moods;
drop policy if exists "public read places"     on places;
drop policy if exists "public read events"     on events;
drop policy if exists "public read reviews"    on reviews;
drop policy if exists "public insert reviews"  on reviews;
drop policy if exists "public read friends"    on friends;
drop policy if exists "public read profiles"   on profiles;
drop policy if exists "public insert profiles" on profiles;
drop policy if exists "public update profiles" on profiles;

create policy "public read moods"      on moods    for select using (true);
create policy "public read places"     on places   for select using (true);
create policy "public read events"     on events   for select using (true);
create policy "public read reviews"    on reviews  for select using (true);
create policy "public insert reviews"  on reviews  for insert with check (true);
create policy "public read friends"    on friends  for select using (true);
create policy "public read profiles"   on profiles for select using (true);
create policy "public insert profiles" on profiles for insert with check (true);
create policy "public update profiles" on profiles for update using (true) with check (true);
