-- Sign-ups by campaign. When someone creates an account, Gable saves the utm_
-- tags of the link that brought them (utm_source, utm_medium, utm_campaign) in
-- their account's user_metadata, plus signup_from ("search_gate" or "signin").
-- Run these in the Supabase SQL editor whenever you want the numbers. Read-only.

-- 1. Accounts per campaign, all time (blank means they came without a tagged link).
select
  coalesce(raw_user_meta_data ->> 'utm_source', '(none)') as source,
  coalesce(raw_user_meta_data ->> 'utm_medium', '(none)') as medium,
  coalesce(raw_user_meta_data ->> 'utm_campaign', '(none)') as campaign,
  count(*) as accounts,
  min(created_at) as first_account,
  max(created_at) as last_account
from auth.users
group by 1, 2, 3
order by accounts desc;

-- 2. The Reddit ad test (Team Aditya HW8): accounts during the 7 days, without our own test accounts.
-- Change the dates and the test email pattern to match your run.
select count(*) as reddit_ad_accounts
from auth.users
where raw_user_meta_data ->> 'utm_campaign' = 'aditya_adtest_nov2026'
  and created_at >= '2026-11-20 12:00-05'
  and created_at <  '2026-11-27 12:30-05'
  and email not ilike '%test%';
