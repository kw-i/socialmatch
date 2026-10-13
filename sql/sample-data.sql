-- ============================================================
-- SocialMatch sample data (Bacolod City, Negros Occidental).
-- Run AFTER schema.sql. Re-run it any time to reset the demo data
-- (event dates are relative to "now", so re-run before recording).
-- NOTE: coordinates are approximate. Right-click a spot in Google Maps
-- to copy exact coordinates and edit the rows below if a pin looks off.
-- Profiles are not touched, so saved profiles survive a reset.
-- ============================================================
truncate table reviews, friends, events, places, moods restart identity cascade;

insert into moods (name, emoji, pref_noise, pref_crowd, pref_social) values
 ('Relaxed',   '🌿', 1, 1, 1),
 ('Reflective','📖', 2, 1, 1),
 ('Chill',     '☕', 2, 2, 2),
 ('Friendly',  '🙂', 3, 3, 3),
 ('Energetic', '⚡', 4, 4, 4),
 ('Party',     '🎉', 5, 5, 4);

-- Place ids are assigned in this order: 1 Cathedral ... 10 Libertad Market.
insert into places (name, lat, lng, category, noise_level, crowd_level, social_level, description) values
 ('San Sebastian Cathedral',   10.6770, 122.9560, 'Landmark',    1, 2, 1, 'Quiet cathedral beside the plaza, good for a calm moment.'),
 ('Capitol Park and Lagoon',   10.6638, 122.9500, 'Park',        2, 2, 2, 'Lagoon walks and benches around the Provincial Capitol.'),
 ('Negros Museum',             10.6648, 122.9525, 'Landmark',    1, 2, 1, 'Heritage museum for slow, quiet browsing.'),
 ('Bacolod Public Plaza',      10.6765, 122.9565, 'Park',        2, 3, 3, 'Open plaza with benches, vendors and evening strollers.'),
 ('The Ruins (Talisay)',       10.7345, 122.9620, 'Landmark',    2, 3, 2, 'Famous mansion ruins with wide grounds and a cafe.'),
 ('Robinsons Place Bacolod',   10.6893, 122.9600, 'Mall',        3, 4, 3, 'Mall with cafes, shops and open seating.'),
 ('SM City Bacolod',           10.6935, 122.9480, 'Mall',        3, 4, 3, 'Large mall in the North Reclamation Area.'),
 ('Manokan Country',           10.6800, 122.9420, 'Food market', 4, 4, 4, 'Row of chicken inasal grills with shared tables by the bay.'),
 ('Lacson Street Eat Street',  10.6800, 122.9570, 'Nightlife',   5, 5, 4, 'Bars, grills and live music, busiest on weekends.'),
 ('Libertad Public Market',    10.6615, 122.9460, 'Market',      4, 5, 3, 'Busy public market for a local feel.');

insert into events (title, lat, lng, event_date, category, social_level, place_id, description) values
 ('Silent Reading Hour',   10.6648, 122.9525, now() + interval '1 day',  'Books',    1, 3,  'Read together in silence, no talking.'),
 ('Sunday Sketch Walk',    10.6638, 122.9500, now() + interval '2 days', 'Art',      2, 2,  'Casual group sketching around the lagoon, all levels.'),
 ('Open Mic Night',        10.6800, 122.9570, now() + interval '3 days', 'Music',    4, 9,  'Live acoustic sets and jam sessions.'),
 ('Inasal Meetup',         10.6800, 122.9420, now() + interval '5 days', 'Food',     3, 8,  'Meet other food lovers at shared tables.'),
 ('MassKara Street Dance', 10.6765, 122.9565, now() + interval '6 days', 'Festival', 4, 4,  'Colorful masks, music and street dancing.'),
 ('Heritage Walk',         10.6770, 122.9560, now() + interval '7 days', 'Culture',  2, 1,  'Guided walk through the old city center.');

insert into reviews (place_id, author, rating, body, created_at) values
 (1,  'Maria Santos',    5, 'Very peaceful in the morning. Perfect for a quiet moment.', now() - interval '9 days'),
 (1,  'Aira Lim',        4, 'Beautiful building. Gets busy on Sundays.',                  now() - interval '6 days'),
 (2,  'Maria Santos',    5, 'Nice lagoon walk, great for reading on a bench.',            now() - interval '8 days'),
 (2,  'Migo Tan',        4, 'Calm and shaded. Bring water.',                              now() - interval '3 days'),
 (3,  'Migo Tan',        5, 'Loved the exhibits. Hardly any crowd on weekdays.',          now() - interval '7 days'),
 (4,  'Bea Villanueva',  4, 'Great evening spot, easy to chat with strangers.',           now() - interval '5 days'),
 (4,  'Carlo Reyes',     3, 'Okay in the afternoon, lively at night.',                    now() - interval '2 days'),
 (6,  'Aira Lim',        4, 'Comfortable seating and good cafes.',                        now() - interval '4 days'),
 (7,  'Carlo Reyes',     4, 'Big and busy but easy to meet friends here.',                now() - interval '4 days'),
 (8,  'Bea Villanueva',  5, 'Best inasal in the city. Shared tables are fun.',            now() - interval '6 days'),
 (8,  'Carlo Reyes',     5, 'Loud, crowded and exactly what I wanted.',                   now() - interval '1 day'),
 (9,  'Carlo Reyes',     5, 'Live music every weekend. Come with friends.',               now() - interval '3 days'),
 (10, 'Bea Villanueva',  4, 'Very local and very busy. Go early.',                        now() - interval '10 days'),
 (5,  'Aira Lim',        5, 'Gorgeous at sunset, worth the trip to Talisay.',              now() - interval '12 days');

insert into friends (name, handle, mood, status_text, place_id) values
 ('Maria Santos',   '@maria',   'Relaxed',   'Reading under a tree',          2),
 ('Carlo Reyes',    '@carlo.r', 'Energetic', 'Anyone up for live music?',     9),
 ('Bea Villanueva', '@beav',    'Friendly',  'Trying every inasal stall',     8),
 ('Migo Tan',       '@migotan', 'Reflective','Taking in the exhibits',        3),
 ('Aira Lim',       '@airalim', 'Chill',     'Sketching the plaza',           4),
 ('Paolo Dizon',    '@paolo.d', 'Party',     'Pre-game at the Eat Street',    9);
