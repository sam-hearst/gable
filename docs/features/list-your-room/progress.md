# Progress: List your room

Dossier: [brief](01-brief.md) · [architecture](02-architecture.md) · [plan](03-plan.md)

## Summary

Done and live on the staging site (demo mode). Not on `main`. Sam tested the whole
path by hand on Nov 6–7: post → pending (hidden) → approved in the dashboard → shows
in `/search` as Real listing → listing page → signed-out "Sign in to contact" →
signed-in "Email" button → lister sees "Live in search" → rejected → gone from search.

## Attention needed

- Re-run `supabase/student_listings.sql` in the Supabase SQL editor (project
  xmhziphxkhvlwxdwtbet) so the tighter insert rule from the review is in force. It's
  safe to run again.
- Before this goes to `main`: a PR with one teammate's review (AGENTS.md).

## Phases

| Phase | Status |
|---|---|
| Clarify | Done (Nov 5): team agreed, `/sublet-your-room`, dashboard approval, Supabase Storage |
| Dossier | Approved by Sam, Nov 5 |
| Build | Done |
| Verify | Done: automated checks plus Sam's manual end-to-end test, Nov 7 |
| Independent review | Done, Nov 7 (see below) |
| Ship | On staging (merged Nov 6, Vercel deploy succeeded). Not on `main` by choice. |

## Independent review (Nov 7)

No serious holes: listers can't approve their own listing or fill in what we checked,
signed-out visitors can't read emails, signed-in users can't see others' pending rows,
storage is per-user, and the production site blocks every new route.

Fixed:
- The insert rule now requires `contact_email` to be the account's email (someone
  calling Supabase directly could have put another student's email on a listing),
  blocks future `created_at` dates (pinning a listing to the top of search) and `..`
  in photo paths.
- "Today" is New York's date, not UTC's, so listings don't drop out of search and the
  form doesn't reject today's dates after about 8pm.

Left as follow-ups (low risk while the team approves every listing by hand):
- Signed-in users can read `user_id` on approved listings (not needed; harmless today).
- No cap on listings or photo uploads per account (the public bucket could be used
  as free image hosting).
- Photos can be orphaned if the tab closes between upload and save; an occasional
  cleanup of files no listing uses would fix it.
- `available_from` can be in the past when posted directly through Supabase.

## Decisions and events

- 2026-11-05: Branch `list-your-room` from `origin/staging`, in a separate worktree, so
  the `fix-bugs-nov5` work in the main checkout isn't touched.
- 2026-11-05: Sam ran `supabase/student_listings.sql` in project xmhziphxkhvlwxdwtbet.
- 2026-11-06: Found and fixed a Date.now() prerender error on `/sublet/[id]` and
  `/sublet-your-room` (added `await connection()`, as `/search` does).
- 2026-11-06: Merged into `staging`; Vercel deploy succeeded. (Local `next build`
  still ends with Next's SecurityFatalError about the Next.js version; it didn't
  block Vercel. Upgrading Next is a separate task.)
- 2026-11-07: Sam tested end to end and rejected the test listing. Independent review
  run; fixes above. Feature closed.
