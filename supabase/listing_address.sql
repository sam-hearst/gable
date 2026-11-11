-- Saves the exact street address a lister picked (for example "70 Morningside
-- Drive, New York, NY, USA"), so the team can check it against the lease when
-- approving. It is private: only the lister (through my_listing_address) and the
-- team (in the dashboard) can read it. Students searching see the street only.
-- Run once in the Supabase SQL editor after student_listings.sql; safe to run again.

alter table public.student_listings
  add column if not exists address text check (address is null or char_length(address) between 5 and 200);

-- Signed-in users could read every column of approved listings. Take the table-wide
-- read away and give back every column except address.
revoke select on public.student_listings from authenticated;
grant select (
  id, user_id, status, title, description, neighborhood, cross_streets, room_type, sleeps, price,
  available_from, available_to, furnished, photos, first_name, school, contact_email, checked, created_at
) on public.student_listings to authenticated;

-- The lister reads their own listing's address through this; nobody else gets one.
create or replace function public.my_listing_address(l uuid) returns text
language sql stable security definer set search_path = '' as $$
  select address from public.student_listings where id = l and user_id = auth.uid();
$$;
revoke all on function public.my_listing_address(uuid) from public;
grant execute on function public.my_listing_address(uuid) to authenticated;
