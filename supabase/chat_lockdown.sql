-- Run once in the Supabase SQL editor; safe to run again.
--
-- 1. Creates chat_preview if it isn't there yet (the peek at a chat's last 3
--    messages on a listing). It refuses signed-out callers itself.
-- 2. Makes every chat function signed-in only. Supabase lets signed-out visitors
--    (anon) call new functions by default; the one exception is chat_member_count,
--    the number the listing page shows to everyone.

create or replace function public.chat_preview(l uuid)
returns table (display_name text, role text, body text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.display_name, m.role, x.body, x.created_at
  from (
    select user_id, body, created_at from public.listing_chat_messages
    where listing_id = l and public.listing_is_approved(l) and auth.uid() is not null
    order by created_at desc limit 3
  ) x
  join public.listing_chat_members m on m.listing_id = l and m.user_id = x.user_id
  order by x.created_at asc;
$$;
revoke all on function public.chat_preview(uuid) from public;
grant execute on function public.chat_preview(uuid) to authenticated;

revoke execute on function
  public.is_listing_host(uuid), public.is_chat_member(uuid), public.chat_is_open(uuid),
  public.listing_is_approved(uuid), public.chat_preview(uuid),
  public.mark_chat_read(uuid), public.my_unread_count(), public.my_chats()
from anon;
