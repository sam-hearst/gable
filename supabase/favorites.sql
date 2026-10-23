-- Saved ("hearted") listings, one row per user per listing.
-- Run once in the Supabase SQL editor. Row level security means each signed-in
-- person can only read, add and remove their own favorites, even though the
-- browser talks to Supabase with the public (publishable) key.

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Read own favorites" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Add own favorites" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Remove own favorites" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);
