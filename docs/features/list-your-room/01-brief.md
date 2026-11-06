# Brief: List your room

## Context

Everything a person can do on the demo site (search, heart, map, book) ends in
made-up SAMPLE listings, so nobody gets real value yet. User growth is graded
on real users, and our professor named legitimate access to real listings as
the biggest problem. Scraping and listing APIs are off the table until the team
approves them. Student sublets posted directly on Gable avoid that, and the
brand position already promises them ("Students on both sides"; "Listers who
post on Gable sign in with a school email… we ask for proof they're on the
lease before a listing gets a checked label").

The team agreed to reverse the "no page for listing your own room" decision
(confirmed by Sam, Nov 5 2026).

**Who:** a Columbia student subletting their room while they're away (the
Jordan persona) who wants a few real students with the right dates instead of
40 random messages. On the other side, the renters already using `/search`.

**Alternatives considered:** doing nothing keeps the demo at zero real
inventory. Scraping or listing APIs are blocked on a legal and team decision.
Hand-adding listings to `listings.ts` from a Google Form would work for a week,
but every listing would need a deploy, and we'd be collecting photos and leases
in a second place.

## Solution outline

1. A signed-in student opens **List your room** (`/sublet-your-room`, demo site
   only) and fills in a short form.
2. The listing is saved to a Supabase `student_listings` table with status
   `pending`. Photos upload to a Supabase Storage bucket, `listing-photos`.
3. The team checks it by hand in the Supabase dashboard: a school email, proof
   they're on the lease, and photos that hold up. Then they set status to
   `approved`, or `rejected`, and write down what they checked.
4. Approved listings show in `/search` next to the samples, with a **Real
   listing** badge, and open on their own page (`/sublet/[id]`). From there, a
   signed-in renter can email the lister.

## Requirements

| ID | Requirement |
|---|---|
| R1 | On the demo site, `/sublet-your-room` shows the form to signed-in people. Signed-out people see a short explanation and a sign-in link that brings them back. On the waitlist site it still redirects home. |
| R2 | The form asks for: a title, a short description, neighborhood (from the areas search knows), nearest cross streets (not the address), room type, how many people it fits, monthly price, available from and to, furnished yes/no, 1–6 photos, first name, and school. It also asks the lister to agree that signed-in students can see their email to contact them. |
| R3 | The server checks every field (types, ranges, `to` after `from`, photos in the signed-in user's own folder) and saves the listing as `pending`. A lister can't set the status or the checks themselves; the database enforces this, not only the form. |
| R4 | A pending or rejected listing never appears in `/search` or at `/sublet/[id]` for anyone but its lister. |
| R5 | The lister sees their own listings and each one's status on `/sublet-your-room` ("Waiting for our check", "Live", "Not approved"). |
| R6 | An approved listing appears in `/search` results when it fits the request, ranked by the same filters as the samples. Real listings come before samples when they fit equally well. |
| R7 | Real listings are clearly labeled: a **Real listing** badge on the card and page. The search side note says which listings are real and which are samples. |
| R8 | `/sublet/[id]` shows the listing's photos, details, the description in the lister's words, what the team checked, and an honest note about what we don't do. Signed-in renters see a button to email the lister; signed-out renters see "Sign in to contact". The lister's email isn't readable by signed-out visitors, even with the public key. |
| R9 | Failure cases: a photo that's too big or the wrong type, an upload that fails, an invalid field, and Supabase not being configured all show a plain message and keep what was typed. Nothing half-saved shows up in search. If the listings table can't be read, `/search` still shows the samples. |
| R10 | The team has written, click-by-click steps for running the SQL and for approving or rejecting a listing. |

## Scope and non-goals

- **In:** the form, the table, the photo bucket, row level security, search
  integration, the real listing page, review steps, and docs and diagrams.
- **Not in v1:** editing a listing after posting (delete and re-post, or the
  team edits it), hearting or mapping real listings (favorites stay
  samples-only, so `FavoritesMap` doesn't change), booking or payment for real
  listings, an admin page, in-app messaging, notifying listers by email when
  they're approved (the team emails them by hand), and automated school-email
  or photo checks.

## UX and copy

Follow `docs/brand_position.md` and `docs/style_guide.md`. Peer tone. Use
"cover your rent while you're away", never "earn income". Never "verified",
"safe" or "guaranteed" as a blanket claim: the badge says **Real listing**, and
the checks list says exactly what we looked at. A real listing's page says plainly:
"Gable can't take payment for real listings yet. See the place, or video call,
and ask to see the lease before you pay anything."

## Analytics and logging

There's no GA on the demo site. Server warnings are logged with a `[listings]` prefix when
saving or reading fails. No new analytics.

## Rollout and flags

This is demo mode only, through the existing `NEXT_PUBLIC_GABLE_MODE=demo` flag. The
waitlist site is unchanged: `/sublet-your-room` still redirects home there, and
`/sublet/*` is sent home by `src/proxy.ts`. It needs `supabase/student_listings.sql`
run once in the shared Supabase project before it's used on staging. Until
then, the form says it couldn't save, and search shows only samples.

## Questions

| Question | Answer | Rationale |
|---|---|---|
| Has the team agreed to reverse "no listing your own room"? | Yes (Sam, Nov 5) | Real inventory is the top problem. |
| Where does the form live? | `/sublet-your-room` | Old links and the Jordan persona already point there. |
| How does the team approve? | Supabase dashboard, Table Editor | No admin code or admin role to secure. |
| Where do photos go? | Supabase Storage, `listing-photos` bucket | Same project, with no new account or key. Approved by Sam. |
| How do renters reach the lister? | Email link, signed-in renters only | Simplest real contact. Hidden from signed-out visitors and scrapers using the public key. The lister agrees on the form. Confirmed by Sam, Nov 5. |
