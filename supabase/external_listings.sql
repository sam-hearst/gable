-- Link cards: sublets someone found on another site (Ohana, Listings Project,
-- a Facebook group...) and shared on /share-a-listing. Gable shows a card with
-- the page's own link preview plus the facts the sharer confirmed, and the card
-- opens the original listing. Nothing is crawled: Gable reads only the one page
-- someone pasted, once, for its preview.
--
-- Run once in the Supabase SQL editor; safe to run again.
--
-- Like student listings, every card starts 'pending' and the team approves it
-- by hand in the Table Editor. Cards expire (expires_at, 21 days by default),
-- since we can't tell when a listing elsewhere gets taken.

create table if not exists public.external_listings (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  url text not null unique check (url ~ '^https?://' and char_length(url) <= 600),
  source text not null check (char_length(source) between 2 and 40),        -- e.g. 'Ohana'
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '' check (char_length(description) <= 300),
  image_url text check (image_url is null or (image_url ~ '^https://' and char_length(image_url) <= 600)),
  -- The fields search filters on, confirmed by the person who shared it.
  neighborhood text not null check (neighborhood in (
    'Morningside Heights', 'Upper West Side', 'Harlem', 'Hamilton Heights', 'Midtown',
    'Williamsburg, Brooklyn', 'Prospect Heights, Brooklyn'
  )),
  room_type text not null check (room_type in ('private room', 'studio', 'shared')),
  sleeps int not null default 1 check (sleeps between 1 and 4),
  price int not null check (price between 300 and 10000), -- per month, USD
  available_from date not null,
  available_to date not null,
  furnished boolean not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '21 days',
  check (available_to > available_from)
);

alter table public.external_listings enable row level security;

-- Everyone sees approved cards that haven't expired.
drop policy if exists "Read approved link cards" on public.external_listings;
create policy "Read approved link cards" on public.external_listings
  for select to anon, authenticated using (status = 'approved' and expires_at > now());

-- You see the cards you shared, any status.
drop policy if exists "Read own link cards" on public.external_listings;
create policy "Read own link cards" on public.external_listings
  for select to authenticated using ((select auth.uid()) = submitted_by);

-- Sharing: your own card, pending, dated now, expiring in at most 21 days.
drop policy if exists "Share link cards" on public.external_listings;
create policy "Share link cards" on public.external_listings
  for insert to authenticated with check (
    (select auth.uid()) = submitted_by
    and status = 'pending'
    and created_at <= now() + interval '1 minute'
    and expires_at <= now() + interval '22 days'
  );

drop policy if exists "Remove own link cards" on public.external_listings;
create policy "Remove own link cards" on public.external_listings
  for delete to authenticated using ((select auth.uid()) = submitted_by);

-- No update policy: only the team (dashboard) approves, edits or extends a card.

-- Signed-out visitors can't see who shared a card.
revoke all on public.external_listings from anon;
grant select (
  id, status, url, source, title, description, image_url, neighborhood, room_type, sleeps, price,
  available_from, available_to, furnished, created_at, expires_at
) on public.external_listings to anon;

create index if not exists external_listings_live_idx
  on public.external_listings (status, expires_at desc);
