# Landing pages (HW5)

A homepage and three landing pages, modeled on daydream.ing's "one chat" search but for verified student sublets near Columbia. Each landing page tests one value prop from our Reddit research and interviews, so each gets its own signups.

| Route | File | Value prop | Audience |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Find a real place near Columbia through one chat | Everyone; routes to the pages below |
| `/verified` | `src/app/verified/page.tsx` | Stop messaging scammers: every lister is a verified tenant | Current students needing a sublet |
| `/summer` | `src/app/summer/page.tsx` | Your summer room, checked in person before you pay | Out-of-town interns, incoming students, parents |
| `/sublet-your-room` | `src/app/sublet-your-room/page.tsx` | A shortlist of verified students, not 40 strangers | Students subletting their own room |
| `/thanks` | `src/app/thanks/page.tsx` | Fires the GA `sign_up` key event | After any signup |

## How it's built

- Shared pieces live in `src/components/landing/`: `ChatHero` (chat box, toggle, chips, signup popup), `SignupForm`, `SiteChrome` (header and footer), and `blocks.tsx` (quotes, steps, listing cards, spot-the-scam, photo CTA). Scroll reveal is CSS-only (scroll-driven animations), so no script touches the rendered markup.
- Styles are in `src/app/landing.css`, imported once in the root layout. Tailwind is still available for new work.
- Photos are hotlinked from Pexels through `px()` in `Photo.tsx`. Example listings and people are labeled as illustrations.
- Old URLs (`/index.html`, `/verified.html`, `/real`, `/interns`, `/describe`, ...) redirect in `next.config.ts`.

## Signups and analytics

- Every form calls the `joinWaitlist` server action (`src/app/actions.ts`), which saves to Supabase through `src/lib/signups.ts`. Each row records `page` (`summer/intern` = page plus the hero toggle), `looking_for` (what they typed in the chat box) and UTM params.
- Production needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel, and `supabase/signups.sql` run once. In local dev, signups go to `.data/signups.jsonl`.
- GA loads in the root layout: GA4 `G-5MEBWDE6BD` in production builds, or `NEXT_PUBLIC_GA_ID` if set. The chat box sends `chat_request`; `/thanks` sends `sign_up`.
- Use lowercase UTMs on every link we post, e.g. `/summer?utm_source=reddit&utm_medium=post&utm_campaign=summer`.

## Honesty notes

- Payments and rent collection are worded as "we're building," not as live features.
- "Checked in person" is our Wizard of Oz piece, so someone on the team has to actually do the visits.
