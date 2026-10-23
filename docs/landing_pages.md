# Landing pages (HW5)

A homepage and three landing pages, modeled on daydream.ing's "one chat" search but for verified student sublets near Columbia. Each landing page tests one value prop from our Reddit research and interviews, so each gets its own signups.

| Route | File | Value prop | Audience |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Find a real place near Columbia through one chat | Everyone; routes to the pages below |
| `/verified` | `src/app/verified/page.tsx` | Stop messaging scammers: every lister is a verified tenant | Current students needing a sublet |
| `/summer` | `src/app/summer/page.tsx` | Your summer room, checked in person before you pay | Out-of-town interns, incoming students, parents |
| `/sublet-your-room` | `src/app/sublet-your-room/page.tsx` | A shortlist of verified students, not 40 strangers | Students subletting their own room |
| `/thanks` | `src/app/thanks/page.tsx` | Fires the GA `sign_up` key event | After any signup |
| `/blog/how-to-find-your-dream-apartment-in-nyc` | `src/app/blog/...`, copy in `src/content/blog.ts` | A useful NYC apartment guide first; Gable is the next step | Anyone searching for an NYC apartment or sublet |

## What each landing page is

Each page tests one promise with one audience, so signups by page tell us which promise pulls.

### 1. `/verified`: "Stop messaging scammers."

- **Who it's for:** current Columbia students who need a semester or summer sublet and keep hitting scams and ghosting in Facebook groups.
- **The pain:** "the hardest part of subletting in nyc was never finding listings, it's figuring out which ones are real" (r/NYCapartments), and Marcus messaging twenty people with half never answering.
- **The promise:** every sublet comes from a verified student tenant, with photos checked and the address confirmed.
- **Traffic:** r/columbia, r/nyc_sublets, Columbia housing groups, and the blog's scam section.

### 2. `/summer`: "Your summer room in NYC, checked before you pay."

- **Who it's for:** out-of-town interns and incoming students who need 10 to 12 weeks and can't tour in person, often with a parent co-paying.
- **The pain:** "It is too far away to just swing by for a visit" (r/Scams).
- **The promise:** real summer sublets with exact dates, each seen in person by someone on our team (our Wizard of Oz piece).
- **Traffic:** r/movingtoNYC, intern and admitted-student groups, and the blog's out-of-town section.

### 3. `/sublet-your-room`: "Sublet your room to a verified student, not 40 strangers."

- **Who it's for:** students subletting their own room for a semester abroad, an internship, or the summer. This is our supply side.
- **The pain:** a flood of replies from strangers, and worry about finding a reliable subletter.
- **The promise:** a short list of Columbia-verified students who fit your dates. You pick one.
- **Traffic:** study-abroad and grad school groups, r/columbia, and the blog's subletting section.

### Blog: "How to Find Your Dream Apartment in NYC"

Not a landing page. It's a real guide people would read even if Gable didn't exist, and it's the "one blog post" in our demand strategy. Three sections link to the matching landing page (`/verified`, `/summer`, `/sublet-your-room`) with `utm_source=blog`, and it ends with the waitlist form, saved with `page=blog`. Unlike the landing pages, it links out to sources like HPD Online.

## Production and staging

- **Production** (gable-one.vercel.app, from `main`) is the waitlist: the pages above, the blog and `/thanks`. Link to it in every post.
- **Staging** (from the `staging` branch, with `NEXT_PUBLIC_GABLE_MODE=demo`) is the MVP demo: search, sign-in and favorites. Use it for demos only. It isn't tracked in GA and isn't indexed.

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
