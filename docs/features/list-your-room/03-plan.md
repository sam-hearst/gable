# Plan: List your room

## Slices

One PR, one slice: the form, the table, search and the listing page are coupled.
A table without a form or a search consumer isn't useful to land alone. It lands
on `staging` (demo) first. `main` gets it only through the normal staging → main
merge, and on main it stays hidden behind waitlist mode.

| Step | Outcome | Files |
|---|---|---|
| 1 | SQL for the table, RLS, bucket and storage policies | `supabase/student_listings.sql` |
| 2 | Data layer and validation | `src/lib/student-listings.ts` |
| 3 | Form, action, and "your listings" | `src/app/sublet-your-room/*`, `src/components/listing/*` |
| 4 | Search integration and labels | `src/lib/search.ts`, `src/app/search/page.tsx`, `ResultCard.tsx` |
| 5 | Real listing page | `src/app/sublet/[id]/page.tsx` |
| 6 | Routing, nav, docs | `proxy.ts`, `next.config.ts`, `SiteChrome.tsx`, `AGENTS.md`, diagrams |

The integration owner is this session. There's no parallel workstream; the files overlap.

## Verification

No test runner exists yet (AGENTS.md), so proof is `npm run lint`, `npm run build`,
and browser observation in demo mode against the shared Supabase project, after
the SQL is run.

| Requirement | Acceptance / failure case | Command / observation | Owner | Evidence / status |
|---|---|---|---|---|
| R1 | Signed out: explanation and sign-in link back. Signed in: form. Waitlist build: redirect home. | Browser, demo dev server; `curl -I` on a non-demo `next start` | Claude | Verified: signed-out card and sign-in link; signed-in form (Chrome, demo dev) |
| R2, R3 | Submit a complete listing → row with `status=pending`, own `user_id`, empty `checked` | Browser submit, then the dashboard or a REST read as the lister | Claude + Sam | Verified: test listing saved, shows "Waiting for our check" |
| R3 | A direct REST insert with `status=approved` is refused | `curl` with the user's token | Claude | Partly: anon insert refused (42501); signed-in insert with status=approved not tried |
| R3, R9 | `to` before `from`, missing photo, or price out of range → message, values kept | Browser | Claude | Verified for end-before-start (browser blocks, values kept) |
| R4 | Pending listing missing from `/search` and `/sublet/[id]` (404) when signed out and for another user | Browser + `curl` | Claude | Verified signed out (REST [], page 404, not in search) and lister's own search; second user not tried |
| R5 | The lister sees "Waiting for our check", then "Live" after approval | Browser | Claude | Half: "Waiting for our check" verified; "Live" waits on approval |
| R6, R7 | After Sam approves in the dashboard: a matching search shows it with a **Real listing** badge, ahead of equal samples. A non-matching search drops it. | Browser | Claude + Sam | Not yet: waits on Sam approving the test row |
| R8 | The page shows photos and details. Signed out: no email, "Sign in to contact". Signed in: an email button. An anon REST select of `contact_email` errors. | Browser + `curl` | Claude | Partly: anon select of contact_email refused; owner preview renders photo; signed-in renter view not seen |
| R9 | Table missing or unreadable → `/search` still renders samples | Run before the SQL exists (natural first state) | Claude | Verified: warning logged, samples shown |
| R10 | Setup and review steps in AGENTS.md / the SQL header are click-by-click | Read-through | Reviewer | pending |
| All | Lint and build pass | `npm run lint && npm run build` | Claude | Verified before the connection() fix; rerun before PR |
| All | Independent review of the code and the walked flow against this table | Subagent reviewer | Reviewer | pending |

## Human approval

- [x] Sam approved this dossier on 2026-11-05, with signed-in-only email contact.

## Rollout

1. Merge the PR into `staging` after one teammate's review.
2. Sam runs `supabase/student_listings.sql` once in the SQL editor (it can run before or after the merge; the code works without it).
3. Post 1–2 real listings from the team's network, approve them, and check staging.
