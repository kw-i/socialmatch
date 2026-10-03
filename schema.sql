-- SocialMatch schema. Run in Supabase: SQL Editor > New query > Run.
create table if not exists moods (
  id serial primary key,
  name text not null unique,
  emoji text,
  pref_noise int not null check (pref_noise between 1 and 5),
  pref_crowd int not null check (pref_crowd between 1 and 5),
  pref_social int not null check (pref_social between 1 and 4)
);

create table if not exists places (
  id serial primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  category text not null,
  noise_level int not null check (noise_level between 1 and 5),
  crowd_level int not null check (crowd_level between 1 and 5),
  social_level int not null check (social_level between 1 and 4), -- 1 solo, 2 low, 3 casual, 4 high
  description text
);

create table if not exists events (
  id serial primary key,
  title text not null,
  lat double precision not null,
  lng double precision not null,
  event_date timestamptz not null,
  category text not null,
  social_level int not null check (social_level between 1 and 4),
  place_id int references places(id) on delete set null,
  description text
);

-- Row Level Security: public read-only (fine for a local school project)
alter table moods enable row level security;
alter table places enable row level security;
alter table events enable row level security;
create policy "public read moods" on moods for select using (true);
create policy "public read places" on places for select using (true);
create policy "public read events" on events for select using (true);

-- Seed data (coordinates are approximate; edit freely)
insert into moods (name, emoji, pref_noise, pref_crowd, pref_social) values
 ('Relaxed','🌿',1,1,1), ('Reflective','📖',2,1,1), ('Chill','☕',2,2,2),
 ('Friendly','🙂',3,3,3), ('Energetic','⚡',4,4,4), ('Party','🎉',5,5,4);

insert into places (name, lat, lng, category, noise_level, crowd_level, social_level, description) values
 ('Cebu Taoist Temple', 10.3376, 123.8914, 'Landmark', 1, 2, 1, 'Hilltop temple with a quiet city view.'),
 ('Cebu Botanical Garden', 10.3275, 123.8963, 'Park', 1, 1, 1, 'Green space for walking or reading alone.'),
 ('Plaza Independencia', 10.2925, 123.9055, 'Park', 2, 2, 2, 'Open plaza beside Fort San Pedro.'),
 ('Magellan''s Cross', 10.2935, 123.9021, 'Landmark', 2, 3, 2, 'Historic site with steady foot traffic.'),
 ('Fuente Osmeña Circle', 10.3111, 123.8910, 'Park', 3, 3, 3, 'Central park with food stalls and benches.'),
 ('Ayala Center Cebu', 10.3187, 123.9052, 'Mall', 3, 4, 3, 'Mall with cafés, shops and a garden terrace.'),
 ('Sugbo Mercado', 10.3290, 123.9060, 'Food market', 4, 4, 4, 'Open-air food market with shared tables.'),
 ('IT Park Night Strip', 10.3300, 123.9055, 'Nightlife', 5, 5, 4, 'Bars and live music, busiest on weekends.'),
 ('SM Seaside City', 10.2823, 123.8800, 'Mall', 3, 4, 3, 'Large mall with a seaside promenade.'),
 ('Carbon Market', 10.2920, 123.8985, 'Market', 4, 5, 3, 'Busy public market for a local feel.');

insert into events (title, lat, lng, event_date, category, social_level, place_id, description) values
 ('Sunday Sketch Walk', 10.3275, 123.8963, now() + interval '2 days', 'Art', 2, 2, 'Casual group sketching, all levels.'),
 ('Open Mic Night', 10.3300, 123.9055, now() + interval '3 days', 'Music', 4, 8, 'Live acoustic sets and jam sessions.'),
 ('Food Market Meetup', 10.3290, 123.9060, now() + interval '5 days', 'Food', 3, 7, 'Meet other food lovers at shared tables.'),
 ('Silent Reading Hour', 10.3187, 123.9052, now() + interval '1 day', 'Books', 1, 6, 'Read together in silence, no talking.'),
 ('Friday Night Party', 10.3300, 123.9055, now() + interval '6 days', 'Party', 4, 8, 'DJ set and dance floor.');
