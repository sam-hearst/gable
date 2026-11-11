-- Unread messages for group chats: remembers when each person last opened a
-- chat, so the Messages item in the sidebar can show how many messages they
-- haven't seen, and the Messages page can list their chats. Run once in the
-- Supabase SQL editor after listing_chats.sql; safe to run again.

alter table public.listing_chat_members
  add column if not exists last_read_at timestamptz not null default now();

-- Opening a chat marks it read. A function (not a table update) so nobody can
-- use it to change their name or role.
create or replace function public.mark_chat_read(l uuid) returns void
language sql security definer set search_path = '' as $$
  update public.listing_chat_members set last_read_at = now()
  where listing_id = l and user_id = auth.uid() and status = 'active';
$$;

-- How many messages from other people the signed-in user hasn't read, in all
-- the chats they're in (chats that have ended don't count).
create or replace function public.my_unread_count() returns int
language sql stable security definer set search_path = '' as $$
  select count(*)::int
  from public.listing_chat_members me
  join public.listing_chats c on c.listing_id = me.listing_id and c.ended_at is null
  join public.listing_chat_messages m on m.listing_id = me.listing_id
  where me.user_id = auth.uid() and me.status = 'active'
    and m.user_id <> auth.uid() and m.created_at > me.last_read_at;
$$;

-- The signed-in user's chats, newest activity first, for the Messages page.
create or replace function public.my_chats()
returns table (listing_id uuid, title text, host_name text, ended boolean, last_body text, last_at timestamptz, unread int)
language sql stable security definer set search_path = '' as $$
  select me.listing_id, l.title, l.first_name, c.ended_at is not null, last.body, coalesce(last.created_at, me.joined_at),
    (select count(*)::int from public.listing_chat_messages m
      where m.listing_id = me.listing_id and m.user_id <> auth.uid() and m.created_at > me.last_read_at)
  from public.listing_chat_members me
  join public.listing_chats c on c.listing_id = me.listing_id
  join public.student_listings l on l.id = me.listing_id
  left join lateral (
    select body, created_at from public.listing_chat_messages m
    where m.listing_id = me.listing_id order by created_at desc limit 1
  ) last on true
  where me.user_id = auth.uid() and me.status = 'active'
  order by coalesce(last.created_at, me.joined_at) desc;
$$;

revoke all on function public.mark_chat_read(uuid), public.my_unread_count(), public.my_chats() from public;
grant execute on function public.mark_chat_read(uuid), public.my_unread_count(), public.my_chats() to authenticated;
