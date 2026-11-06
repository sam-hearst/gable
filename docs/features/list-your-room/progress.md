# Progress: List your room

Dossier: [brief](01-brief.md) · [architecture](02-architecture.md) · [plan](03-plan.md)

## Summary

Built on branch `list-your-room` (from `origin/staging`). Posting, pending-hidden and the lister preview are verified in demo mode against the shared Supabase project; approval → search is not verified yet.

## Attention needed

- Sam: approve the test listing ("TEST listing, please reject") in the dashboard, then check `/search` shows it as Real listing; reject or delete it afterwards.
- Independent review not run yet.

## Phases

| Phase | Status |
|---|---|
| Clarify | Done (Nov 5): team agreed, `/sublet-your-room`, dashboard approval, Supabase Storage |
| Dossier | Approved by Sam, Nov 5 |
| Build | Done |
| Verify | Partly done (see plan table) |
| PR | Not started |

## Decisions and events

- 2026-11-05: Branch `list-your-room` from `origin/staging`, in a separate worktree, so
  the `fix-bugs-nov5` work in the main checkout isn't touched.
- 2026-11-05: Sam ran `supabase/student_listings.sql` in project xmhziphxkhvlwxdwtbet.
- 2026-11-06: Found and fixed a Date.now() prerender error on `/sublet/[id]` and
  `/sublet-your-room` (added `await connection()`, as `/search` does).
