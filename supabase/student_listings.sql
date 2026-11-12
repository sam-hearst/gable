-- Real sublets posted by students on /sublet-your-room (demo site), and the
-- bucket for their photos. Run once in the Supabase SQL editor; it's safe to
-- run again.
--
-- Every new listing starts as 'pending' and stays hidden until the team checks
-- it by hand and sets status to 'approved' in the Table Editor (steps in
-- AGENTS.md). Row level security enforces this even though the browser talks
-- to Supabase with the public (publishable) key: a lister can't approve their
-- own listing or fill in what we checked.

create table if not exists public.student_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  title text not null check (char_length(title) between 3 and 80),
  description text not null check (char_length(description) between 20 and 1000),
  -- Must be one of NEIGHBORHOODS: checked below, where re-running this file updates it.
  neighborhood text not null,
  cross_streets text not null check (char_length(cross_streets) between 3 and 80),
  room_type text not null check (room_type in ('private room', 'studio', 'shared')),
  sleeps int not null default 1 check (sleeps between 1 and 4),
  price int not null check (price between 300 and 10000), -- per month, USD
  available_from date not null,
  available_to date not null,
  furnished boolean not null,
  photos text[] not null check (cardinality(photos) between 1 and 6), -- paths in listing-photos
  first_name text not null check (char_length(first_name) between 1 and 40),
  school text not null check (char_length(school) between 2 and 60),
  contact_email text not null,
  -- Filled in by the team when they approve, e.g. {"Columbia email verified","Lease on file"}
  checked text[] not null default '{}',
  created_at timestamptz not null default now(),
  check (available_to > available_from)
);

-- The neighborhoods a lister can pick: NEIGHBORHOOD_GROUPS in
-- src/lib/student-listing-fields.ts, named like StreetEasy. Dropped and added
-- again so re-running this file picks up a changed list.
alter table public.student_listings drop constraint if exists student_listings_neighborhood_check;
alter table public.student_listings add constraint student_listings_neighborhood_check check (neighborhood in (
  'Morningside Heights', 'Upper West Side', 'Manhattan Valley', 'Lincoln Square',
  'Harlem', 'West Harlem', 'East Harlem', 'Hamilton Heights', 'Washington Heights',
  'Hudson Heights', 'Inwood', 'Upper East Side', 'Yorkville', 'Lenox Hill', 'Carnegie
  Hill', 'Roosevelt Island', 'Midtown', 'Midtown East', 'Midtown South', 'Hell''s
  Kitchen', 'Hudson Yards', 'Murray Hill', 'Kips Bay', 'NoMad', 'Gramercy Park',
  'Stuyvesant Town', 'Flatiron', 'Chelsea', 'West Village', 'Greenwich Village', 'East
  Village', 'NoHo', 'SoHo', 'Nolita', 'Little Italy', 'Lower East Side', 'Chinatown',
  'Two Bridges', 'Tribeca', 'Financial District', 'Battery Park City', 'Manhattan',
  'Williamsburg, Brooklyn', 'East Williamsburg, Brooklyn', 'Greenpoint, Brooklyn',
  'Bushwick, Brooklyn', 'Bedford-Stuyvesant, Brooklyn', 'Clinton Hill, Brooklyn',
  'Fort Greene, Brooklyn', 'Prospect Heights, Brooklyn', 'Crown Heights, Brooklyn',
  'Prospect Lefferts Gardens, Brooklyn', 'Flatbush, Brooklyn', 'Ditmas Park,
  Brooklyn', 'Kensington, Brooklyn', 'Park Slope, Brooklyn', 'Windsor Terrace,
  Brooklyn', 'Gowanus, Brooklyn', 'Carroll Gardens, Brooklyn', 'Cobble Hill,
  Brooklyn', 'Boerum Hill, Brooklyn', 'Columbia Street Waterfront District, Brooklyn',
  'Brooklyn Heights, Brooklyn', 'Downtown Brooklyn, Brooklyn', 'DUMBO, Brooklyn',
  'Vinegar Hill, Brooklyn', 'Red Hook, Brooklyn', 'Sunset Park, Brooklyn', 'Bay Ridge,
  Brooklyn', 'Midwood, Brooklyn', 'Brooklyn', 'Astoria, Queens', 'Ditmars-Steinway,
  Queens', 'Long Island City, Queens', 'Sunnyside, Queens', 'Woodside, Queens',
  'Jackson Heights, Queens', 'Elmhurst, Queens', 'Rego Park, Queens', 'Forest Hills,
  Queens', 'Kew Gardens, Queens', 'Ridgewood, Queens', 'Flushing, Queens', 'Queens',
  'Riverdale, Bronx', 'Kingsbridge, Bronx', 'Fordham, Bronx', 'Concourse, Bronx',
  'Mott Haven, Bronx', 'Port Morris, Bronx', 'Bronx', 'St. George, Staten Island',
  'Tompkinsville, Staten Island', 'Stapleton, Staten Island', 'Staten Island'
));

alter table public.student_listings enable row level security;

drop policy if exists "Read approved listings" on public.student_listings;
create policy "Read approved listings" on public.student_listings
  for select to anon, authenticated using (status = 'approved');

drop policy if exists "Read own listings" on public.student_listings;
create policy "Read own listings" on public.student_listings
  for select to authenticated using ((select auth.uid()) = user_id);

-- New listings: your own, pending, nothing checked yet, contact email is your
-- account email, posted now (not dated ahead to sit at the top of search), and
-- photos only from your own folder. These hold even for someone who skips the
-- form and calls Supabase directly with the public key.
drop policy if exists "Post own listings" on public.student_listings;
create policy "Post own listings" on public.student_listings
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and checked = '{}'
    and contact_email = (select auth.jwt() ->> 'email')
    and created_at <= now() + interval '1 minute'
    and not exists (
      select 1 from unnest(photos) p
      where p not like (select auth.uid())::text || '/%' or p like '%..%'
    )
  );

drop policy if exists "Remove own listings" on public.student_listings;
create policy "Remove own listings" on public.student_listings
  for delete to authenticated using ((select auth.uid()) = user_id);

-- No update policy: listers can't edit (or approve) a listing. The team edits
-- in the dashboard, which bypasses row level security.

-- Signed-out visitors (anon) can't read who posted a listing or their email.
-- Signed-in students can, so they can contact the lister (the lister agrees
-- to this on the form).
revoke all on public.student_listings from anon;
grant select (
  id, status, title, description, neighborhood, cross_streets, room_type, sleeps, price,
  available_from, available_to, furnished, photos, first_name, school, checked, created_at
) on public.student_listings to anon;

-- Photos: a public bucket (anyone with the link can view a photo; names are
-- random), 5 MB each, JPEG, PNG or WebP. Signed-in users upload into and
-- delete from their own folder only: listing-photos/<their user id>/...
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Upload own listing photos" on storage.objects;
create policy "Upload own listing photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "See own listing photos" on storage.objects;
create policy "See own listing photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Delete own listing photos" on storage.objects;
create policy "Delete own listing photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
