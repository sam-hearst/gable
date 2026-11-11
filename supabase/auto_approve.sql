-- Auto-approve listings from students with a confirmed school email. Run once in
-- the Supabase SQL editor after student_listings.sql; safe to run again.
--
-- It ships OFF. Until you turn it on, every listing stays pending exactly as
-- before. Turn it on only after "Confirm email" is enabled in Supabase
-- (Authentication > Providers > Email), because with confirmation off anyone can
-- type name@columbia.edu without owning it, and the check would mean nothing.
--
--   Turn on:  update public.listing_settings set auto_approve = true;
--   Turn off: update public.listing_settings set auto_approve = false;
--   Schools:  update public.listing_settings set school_domains = array['columbia.edu','barnard.edu'];
--
-- A listing goes live at once when the poster's account email is confirmed and
-- ends in one of the school domains (or a subdomain like cs.columbia.edu).
-- Everything else stays pending for the team to approve by hand.

create table if not exists public.listing_settings (
  id boolean primary key default true check (id), -- one row only
  auto_approve boolean not null default false,
  school_domains text[] not null default array['columbia.edu', 'barnard.edu']
);
insert into public.listing_settings (id) values (true) on conflict (id) do nothing;
alter table public.listing_settings enable row level security;
revoke all on public.listing_settings from anon, authenticated; -- no policies: only the team (dashboard) edits it

-- Is this person allowed to post straight to live? One rule, used by both the
-- trigger and the insert policy, so a client can't claim it.
create or replace function public.can_auto_approve(u uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.listing_settings s, auth.users a
    where s.auto_approve and a.id = u and a.email_confirmed_at is not null
      and exists (
        select 1 from unnest(s.school_domains) d
        where lower(split_part(a.email, '@', 2)) = d or lower(split_part(a.email, '@', 2)) like '%.' || d
      )
  );
$$;
revoke all on function public.can_auto_approve(uuid) from public, anon;
grant execute on function public.can_auto_approve(uuid) to authenticated;

create or replace function public.auto_approve_listing() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'pending' and new.checked = '{}' and public.can_auto_approve(new.user_id) then
    new.status := 'approved';
    new.checked := array['School email verified'];
  end if;
  return new;
end;
$$;
drop trigger if exists auto_approve_listing on public.student_listings;
create trigger auto_approve_listing before insert on public.student_listings
  for each row execute function public.auto_approve_listing();

-- The insert policy now also accepts the one approved shape the trigger makes.
-- Row level security checks the row after the trigger runs.
drop policy if exists "Post own listings" on public.student_listings;
create policy "Post own listings" on public.student_listings
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and (
      (status = 'pending' and checked = '{}')
      or (status = 'approved' and checked = array['School email verified'] and public.can_auto_approve((select auth.uid())))
    )
    and contact_email = (select auth.jwt() ->> 'email')
    and created_at <= now() + interval '1 minute'
    and not exists (
      select 1 from unnest(photos) p
      where p not like (select auth.uid())::text || '/%' or p like '%..%'
    )
  );
