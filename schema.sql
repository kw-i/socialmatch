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

-- Seed data (Bacolod City, Negros Occidental. Coordinates are approximate; edit freely)
insert into moods (name, emoji, pref_noise, pref_crowd, pref_social) values
 ('Relaxed','🌿',1,1,1), ('Reflective','📖',2,1,1), ('Chill','☕',2,2,2),
 ('Friendly','🙂',3,3,3), ('Energetic','⚡',4,4,4), ('Party','🎉',5,5,4);

insert into places (name, lat, lng, category, noise_level, crowd_level, social_level, description) values
 ('San Sebastian Cathedral', 10.6770, 122.9560, 'Landmark', 1, 2, 1, 'Quiet cathedral beside the plaza, good for a calm moment.'),
 ('Capitol Park and Lagoon', 10.6638, 122.9500, 'Park', 2, 2, 2, 'Lagoon walks and benches around the Provincial Capitol.'),
 ('Negros Museum', 10.6648, 122.9525, 'Landmark', 1, 2, 1, 'Heritage museum for slow, quiet browsing.'),
 ('Bacolod Public Plaza', 10.6765, 122.9565, 'Park', 2, 3, 3, 'Open plaza with benches, vendors and evening strollers.'),
 ('The Ruins (Talisay)', 10.7345, 122.9620, 'Landmark', 2, 3, 2, 'Famous mansion ruins with wide grounds and a café.'),
 ('Robinsons Place Bacolod', 10.6893, 122.9600, 'Mall', 3, 4, 3, 'Mall with cafés, shops and open seating.'),
 ('SM City Bacolod', 10.6935, 122.9480, 'Mall', 3, 4, 3, 'Large mall in the North Reclamation Area.'),
 ('Manokan Country', 10.6800, 122.9420, 'Food market', 4, 4, 4, 'Row of chicken inasal grills with shared tables by the bay.'),
 ('Lacson Street Eat Street', 10.6800, 122.9570, 'Nightlife', 5, 5, 4, 'Bars, grills and live music, busiest on weekends.'),
 ('Libertad Public Market', 10.6615, 122.9460, 'Market', 4, 5, 3, 'Busy public market for a local feel.');

insert into events (title, lat, lng, event_date, category, social_level, place_id, description) values
 ('Sunday Sketch Walk', 10.6638, 122.9500, now() + interval '2 days', 'Art', 2, 2, 'Casual group sketching around the lagoon, all levels.'),
 ('Open Mic Night', 10.6800, 122.9570, now() + interval '3 days', 'Music', 4, 9, 'Live acoustic sets and jam sessions.'),
 ('Inasal Meetup', 10.6800, 122.9420, now() + interval '5 days', 'Food', 3, 8, 'Meet other food lovers at shared tables.'),
 ('Silent Reading Hour', 10.6648, 122.9525, now() + interval '1 day', 'Books', 1, 3, 'Read together in silence, no talking.'),
 ('MassKara Street Dance', 10.6765, 122.9565, now() + interval '6 days', 'Festival', 4, 4, 'Colorful masks, music and street dancing.');
