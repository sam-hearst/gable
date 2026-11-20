-- Private messages between a renter and the lister of a real listing: one
-- thread per renter per listing, with unread tracking. Replaces the "email the
-- lister" button, so renters never see the lister's email. Run once in the
-- Supabase SQL editor after student_listings.sql; safe to run again.
--
-- Everything is enforced by row level security, because the browser talks to
-- Supabase with the public (publishable) key: only the renter and the lister of
-- a thread can read it or write to it. Nobody can create a thread by inserting
-- a row: they go through start_dm(), which checks the listing is approved and
-- that you aren't messaging yourself, and fills in who the lister is.

create table if not exists public.listing_dms (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.student_listings (id) on delete cascade,
  renter_id uuid not null references auth.users (id) on delete cascade,
  lister_id uuid not null references auth.users (id) on delete cascade,
  renter_name text not null check (char_length(renter_name) between 1 and 40),
  renter_last_read_at timestamptz not null default now(),
  lister_last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, renter_id),
  check (renter_id <> lister_id)
);

create table if not exists public.listing_dm_messages (
  id uuid primary key default gen_random_uuid(),
  dm_id uuid not null references public.listing_dms (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists listing_dm_messages_by_dm on public.listing_dm_messages (dm_id, created_at);
create index if not exists listing_dms_by_lister on public.listing_dms (lister_id);
create index if not exists listing_dms_by_renter on public.listing_dms (renter_id);

alter table public.listing_dms enable row level security;
alter table public.listing_dm_messages enable row level security;

-- Helper. Runs with the owner's rights so a policy can look at the thread
-- without recursing into its own policies.
create or replace function public.is_dm_participant(d uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.listing_dms
    where id = d and (renter_id = auth.uid() or lister_id = auth.uid())
  );
$$;

-- Threads: you see the ones you're in. No insert, update or delete policy:
-- threads start with start_dm() and "read" times move with mark_dm_read().
drop policy if exists "Read own threads" on public.listing_dms;
create policy "Read own threads" on public.listing_dms
  for select to authenticated using (renter_id = (select auth.uid()) or lister_id = (select auth.uid()));

-- Messages: the two people in the thread read them and send their own.
drop policy if exists "Read thread messages" on public.listing_dm_messages;
create policy "Read thread messages" on public.listing_dm_messages
  for select to authenticated using (public.is_dm_participant(dm_id));

drop policy if exists "Send thread messages" on public.listing_dm_messages;
create policy "Send thread messages" on public.listing_dm_messages
  for insert to authenticated with check (user_id = (select auth.uid()) and public.is_dm_participant(dm_id));

revoke all on public.listing_dms, public.listing_dm_messages from anon;
-- Nobody can change a thread or its messages from the browser, even their own.
revoke update, delete, truncate on public.listing_dms, public.listing_dm_messages from authenticated;
revoke insert on public.listing_dms from authenticated;

-- Start (or find) your thread with the lister of an approved listing. Returns
-- the thread's id. You can't message your own listing.
create or replace function public.start_dm(l uuid, name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  owner uuid;
  clean text := left(btrim(regexp_replace(coalesce(name, ''), '\s+', ' ', 'g')), 40);
  d uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if clean = '' then raise exception 'name needed'; end if;
  select user_id into owner from public.student_listings where id = l and status = 'approved';
  if owner is null then raise exception 'listing not available'; end if;
  if owner = auth.uid() then raise exception 'that is your own listing'; end if;
  insert into public.listing_dms (listing_id, renter_id, lister_id, renter_name)
  values (l, auth.uid(), owner, clean)
  on conflict (listing_id, renter_id) do nothing;
  select id into d from public.listing_dms where listing_id = l and renter_id = auth.uid();
  return d;
end;
$$;

-- Opening a thread marks it read, for you only.
create or replace function public.mark_dm_read(d uuid) returns void
language sql security definer set search_path = '' as $$
  update public.listing_dms set
    renter_last_read_at = case when renter_id = auth.uid() then now() else renter_last_read_at end,
    lister_last_read_at = case when lister_id = auth.uid() then now() else lister_last_read_at end
  where id = d and (renter_id = auth.uid() or lister_id = auth.uid());
$$;

-- How many private messages from the other person you haven't read.
create or replace function public.my_dm_unread_count() returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int
  from public.listing_dms t
  join public.listing_dm_messages m on m.dm_id = t.id
  where m.user_id <> auth.uid()
    and ((t.renter_id = auth.uid() and m.created_at > t.renter_last_read_at)
      or (t.lister_id = auth.uid() and m.created_at > t.lister_last_read_at));
$$;

-- Your private threads, newest activity first, for the Messages page. other_name
-- is the person on the other side: the lister's first name for a renter, the
-- renter's chosen name for a lister.
create or replace function public.my_dms()
returns table (dm_id uuid, listing_id uuid, title text, other_name text, as_lister boolean, last_body text, last_at timestamptz, unread int)
language sql stable security definer set search_path = '' as $$
  select t.id, t.listing_id, l.title,
    case when t.lister_id = auth.uid() then t.renter_name else l.first_name end,
    t.lister_id = auth.uid(),
    last.body, coalesce(last.created_at, t.created_at),
    (select count(*)::int from public.listing_dm_messages m
      where m.dm_id = t.id and m.user_id <> auth.uid()
        and m.created_at > case when t.lister_id = auth.uid() then t.lister_last_read_at else t.renter_last_read_at end)
  from public.listing_dms t
  join public.student_listings l on l.id = t.listing_id
  left join lateral (
    select body, created_at from public.listing_dm_messages m where m.dm_id = t.id order by created_at desc limit 1
  ) last on true
  where t.renter_id = auth.uid() or t.lister_id = auth.uid()
  order by coalesce(last.created_at, t.created_at) desc;
$$;

revoke all on function public.is_dm_participant(uuid), public.start_dm(uuid, text), public.mark_dm_read(uuid),
  public.my_dm_unread_count(), public.my_dms() from public;
grant execute on function public.is_dm_participant(uuid), public.start_dm(uuid, text), public.mark_dm_read(uuid),
  public.my_dm_unread_count(), public.my_dms() to authenticated;
-- Supabase also gives signed-out visitors new functions by default.
revoke execute on function public.is_dm_participant(uuid), public.start_dm(uuid, text), public.mark_dm_read(uuid),
  public.my_dm_unread_count(), public.my_dms() from anon;

-- The lister's email is no longer shown to renters, so take the column away
-- from signed-in visitors too (Gable no longer reads it; the team still sees it
-- in the dashboard, which isn't affected). Signing up a listing still works:
-- the insert policy checks contact_email, and inserting needs no read access.
revoke select on public.student_listings from authenticated;
grant select (
  id, user_id, status, title, description, neighborhood, cross_streets, room_type, sleeps, price,
  available_from, available_to, furnished, photos, first_name, school, checked, created_at
) on public.student_listings to authenticated;
