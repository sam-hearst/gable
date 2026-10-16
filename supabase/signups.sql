-- Waitlist signups from the homepage and landing pages.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Columns match the Signup type in src/lib/signups.ts.

create table if not exists public.signups (
  id bigint generated always as identity primary key,
  email text not null,
  looking_for text,
  page text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

-- Row level security on with no policies: the public (anon) key can't read or
-- write emails. The app writes with the service role key, which bypasses RLS
-- and must only ever live on the server (never a NEXT_PUBLIC_ variable).
alter table public.signups enable row level security;

create index if not exists signups_created_at_idx on public.signups (created_at desc);
