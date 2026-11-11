-- Group chat for each real listing: the host (the student subletting) plus the
-- students interested in the room. The host moderates: they can remove a
-- person, delete a message, and end the chat once the room is taken. Run once in
-- the Supabase SQL editor after student_listings.sql; safe to run again.
--
-- Everything is enforced by row level security, because the browser talks to
-- Supabase with the public (publishable) key: only people in a chat can read or
-- write it, nobody can post after it has ended, and only the listing's own
-- poster can act as host.

create table if not exists public.listing_chats (
  listing_id uuid primary key references public.student_listings (id) on delete cascade,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.listing_chat_members (
  listing_id uuid not null references public.listing_chats (listing_id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  role text not null default 'member' check (role in ('host', 'member')),
  status text not null default 'active' check (status in ('active', 'removed')),
  joined_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

create table if not exists public.listing_chat_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listing_chats (listing_id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists listing_chat_messages_by_chat on public.listing_chat_messages (listing_id, created_at);

alter table public.listing_chats enable row level security;
alter table public.listing_chat_members enable row level security;
alter table public.listing_chat_messages enable row level security;

-- Helpers. They run with the owner's rights so a policy can look at another
-- table (or its own) without recursing into that table's policies.
create or replace function public.is_listing_host(l uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.student_listings where id = l and user_id = auth.uid());
$$;

create or replace function public.is_chat_member(l uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.listing_chat_members
    where listing_id = l and user_id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.chat_is_open(l uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.listing_chats where listing_id = l and ended_at is null);
$$;

create or replace function public.listing_is_approved(l uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.student_listings where id = l and status = 'approved');
$$;

-- How many students are in a chat, for the listing page. Just a number.
create or replace function public.chat_member_count(l uuid) returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int from public.listing_chat_members where listing_id = l and status = 'active';
$$;

revoke all on function public.is_listing_host(uuid), public.is_chat_member(uuid), public.chat_is_open(uuid),
  public.listing_is_approved(uuid), public.chat_member_count(uuid) from public;
grant execute on function public.is_listing_host(uuid), public.is_chat_member(uuid), public.chat_is_open(uuid),
  public.listing_is_approved(uuid), public.chat_member_count(uuid) to authenticated;
grant execute on function public.chat_member_count(uuid) to anon;

-- Chats: any signed-in student can see whether a listing's chat exists or has
-- ended. The first person to tap "Join the group chat" on an approved listing
-- starts it, so nobody hits a dead end; the host sees all of it and only the
-- host ends it.
drop policy if exists "Read chats" on public.listing_chats;
create policy "Read chats" on public.listing_chats
  for select to authenticated using (true);

drop policy if exists "Start chat" on public.listing_chats;
drop policy if exists "Host starts chat" on public.listing_chats;
create policy "Start chat" on public.listing_chats
  for insert to authenticated with check (public.listing_is_approved(listing_id) and ended_at is null);

drop policy if exists "Host ends chat" on public.listing_chats;
create policy "Host ends chat" on public.listing_chats
  for update to authenticated
  using (public.is_listing_host(listing_id))
  with check (public.is_listing_host(listing_id));

-- Members: people in the chat see each other. You add yourself while the chat
-- is open (as host only if it's your own listing). You can leave; the host can
-- remove someone, who then can't rejoin.
drop policy if exists "See fellow members" on public.listing_chat_members;
create policy "See fellow members" on public.listing_chat_members
  for select to authenticated using (public.is_chat_member(listing_id) or public.is_listing_host(listing_id));

drop policy if exists "Join open chat" on public.listing_chat_members;
create policy "Join open chat" on public.listing_chat_members
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and status = 'active'
    and public.chat_is_open(listing_id)
    and role = (case when public.is_listing_host(listing_id) then 'host' else 'member' end)
  );

drop policy if exists "Leave chat" on public.listing_chat_members;
create policy "Leave chat" on public.listing_chat_members
  for delete to authenticated using (user_id = (select auth.uid()) and status = 'active');

drop policy if exists "Host removes members" on public.listing_chat_members;
create policy "Host removes members" on public.listing_chat_members
  for update to authenticated
  using (public.is_listing_host(listing_id))
  with check (public.is_listing_host(listing_id) and role = 'member');

-- Messages: members read; members write while the chat is open; you can delete
-- your own, and the host can delete anyone's.
drop policy if exists "Read chat messages" on public.listing_chat_messages;
create policy "Read chat messages" on public.listing_chat_messages
  for select to authenticated using (public.is_chat_member(listing_id) or public.is_listing_host(listing_id));

drop policy if exists "Send chat messages" on public.listing_chat_messages;
create policy "Send chat messages" on public.listing_chat_messages
  for insert to authenticated with check (
    user_id = (select auth.uid()) and public.is_chat_member(listing_id) and public.chat_is_open(listing_id)
  );

drop policy if exists "Delete chat messages" on public.listing_chat_messages;
create policy "Delete chat messages" on public.listing_chat_messages
  for delete to authenticated using (user_id = (select auth.uid()) or public.is_listing_host(listing_id));

revoke all on public.listing_chats, public.listing_chat_members, public.listing_chat_messages from anon;
