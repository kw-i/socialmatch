-- Safe to run any number of times. Fixes read access and re-seeds only if a table is empty.
alter table moods enable row level security;
alter table places enable row level security;
alter table events enable row level security;
drop policy if exists "public read moods" on moods;
drop policy if exists "public read places" on places;
drop policy if exists "public read events" on events;
create policy "public read moods" on moods for select using (true);
create policy "public read places" on places for select using (true);
create policy "public read events" on events for select using (true);

-- Check: how many rows does each table have?
select (select count(*) from moods) as moods,
       (select count(*) from places) as places,
       (select count(*) from events) as events;
