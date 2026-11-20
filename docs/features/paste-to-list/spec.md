# Paste your post (Whetstone spec)

**Date:** November 20, 2026 · **Branch:** `paste-to-list` → `staging` · **Owner:** Sam

## Problem
Search on gable.fit often shows no sublets. Students who are subletting have usually already written a
post for Facebook, Instagram or a group chat; retyping it into our form is the step that loses them.

## Behavior
- On `/sublet-your-room`, signed-in students see a "Paste your post" box above the form.
- "Fill in the form" sends the text to a server action, which asks Claude (`claude-haiku-5-5`, 8 s
  timeout, server-only key) for: start and end dates, monthly rent, neighborhood (from our list),
  kind of space, furnished, address, and a description in their own words with phone numbers, emails,
  handles and payment handles removed.
- Only stated fields are filled. Anything the post doesn't say stays blank (or keeps what the student
  already typed). A note says what was filled and what was left blank.
- Nothing is saved. The student adds a title and photos, checks every field and sends the form as before.
- If Claude isn't set up, fails or times out: the form stays as it is, with "We couldn't read your post
  just now. Fill in the form below, or try again in a minute."

## Scope
In: the paste box, the server action, prefill, a shared Claude helper (`src/lib/claude.ts`, now also
used by search), privacy policy line, AGENTS.md and diagram. Out: photos from the post, title,
"how many people it fits", saving the pasted text, rate limiting beyond sign-in.

## Approach
- Claude returns dates as month/day/year exactly as written; code picks the year (next occurrence on or
  after today, end date after the start). This avoids Claude guessing the year.
- Every field is re-checked in `validate()` with the same limits the form and server enforce (rent
  $300 to $10,000, description 20 to 1,000 characters, neighborhood from `NEIGHBORHOODS`).
- The action returns null for signed-out callers, so the Claude key can't be used anonymously.

- A date with no year that's less than 60 days past ("Nov 1", read on Nov 20) stays blank instead of
  jumping to next year. Written years must be this year to two years out ("27" means 2027).

## Independent review (Nov 20)
Fixed: recent past dates rolled a year ahead; two-digit or far-off years weren't checked; the note said
"your post didn't say" for fields that were stated but failed a check (now "We couldn't fill in…").
Open: sign-in is the only abuse limit (Confirm email is off), so add a per-account throttle before
heavy promotion.

## Questions
- Should "this summer" fill June 1 to August 31? Currently left blank (not a stated date).
- Rate limiting per account, if the endpoint gets abused.

## Verification
| Check | How | Result |
|---|---|---|
| Full post fills every field, strips phone and "DM me" | 6 sample posts through `readPost` on a dev server | Pass |
| Weekly price, vague dates, past year stay blank | same | Pass |
| Not a sublet post returns all blank, note says so | same | Pass |
| Dec to Jan wraps the year | same (2026-12-20 to 2027-01-15) | Pass |
| Prefill in the real form, phone width | temporary preview page in the browser pane | Pass |
| Signed out → failure note | same, sign-in check on | Pass |
| Search still reads with Claude after the refactor | `search()` on a dev server → `source: "claude"` | Pass |
| Signed-in flow on `/sublet-your-room` | needs a real account; test on the staging deploy | Unverified |
| `npm run lint`, `npm run build` | | Pass |

## Rollout
Merge to `staging`, test signed in on the staging deploy, then to `main`. No SQL, no new env vars
(`ANTHROPIC_API_KEY` is already in Vercel). Review: one teammate.
