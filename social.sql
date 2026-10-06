-- Run once in the Supabase SQL Editor. Reviews live only in your app's database.
create table if not exists reviews (
  id serial primary key,
  place_id int not null references places(id) on delete cascade,
  author text not null,
  rating int not null check (rating between 1 and 5),
  body text default '',
  created_at timestamptz default now()
);
alter table reviews enable row level security;
drop policy if exists "public read reviews" on reviews;
drop policy if exists "public add reviews" on reviews;
create policy "public read reviews" on reviews for select using (true);
create policy "public add reviews" on reviews for insert with check (true);

insert into reviews (place_id, author, rating, body)
select id, 'Maria Santos', 5, 'So peaceful. Perfect for reading alone.' from places where name = 'Cebu Botanical Garden';
insert into reviews (place_id, author, rating, body)
select id, 'Carlo Reyes', 4, 'Loud and packed on weekends, which is the point.' from places where name = 'IT Park Night Strip';
insert into reviews (place_id, author, rating, body)
select id, 'Bea Villanueva', 5, 'Easy to chat with strangers at the shared tables.' from places where name = 'Sugbo Mercado';
