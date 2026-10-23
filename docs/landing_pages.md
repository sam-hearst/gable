# Landing pages (HW5)

A homepage and three landing pages, modeled on daydream.ing's "one chat" search but for verified student sublets near Columbia. Each landing page tests one value prop from our Reddit research and interviews, so each gets its own signups.

**Sublets only, for now.** Every page talks about sublets, not rooms or apartments. A listing still says what the space is ("Sublet · private room in a 3BR"), because renters need to know. The page for students listing their own room (`/sublet-your-room`) is paused and redirects home; it's in git history if we bring it back.

| Route | File | Value prop | Audience |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Find a real place near Columbia through one chat | Everyone; routes to the pages below |
| `/verified` | `src/app/verified/page.tsx` | Stop messaging scammers: every lister is a verified tenant | Current students needing a sublet |
| `/summer` | `src/app/summer/page.tsx` | Your summer sublet, checked in person before you pay | Out-of-town interns, incoming students, parents |
| `/together` | `src/app/together/page.tsx` | A sublet for two, with dates that work for both of you | Two students looking together |
| `/thanks` | `src/app/thanks/page.tsx` | Fires the GA `sign_up` key event | After any signup |
| `/blog/how-to-find-your-dream-sublet-in-nyc` | `src/app/blog/...`, copy in `src/content/blog.ts` | A useful NYC sublet guide first; Gable is the next step | Anyone searching for an NYC sublet |

## What each landing page is

Each page tests one promise with one audience, so signups by page tell us which promise pulls.

### 1. `/verified`: "Stop messaging scammers."

- **Who it's for:** current Columbia students who need a semester or summer sublet and keep hitting scams and ghosting in Facebook groups.
- **The pain:** "the hardest part of subletting in nyc was never finding listings, it's figuring out which ones are real" (r/NYCapartments), and Marcus messaging twenty people with half never answering.
- **The promise:** every sublet comes from a verified student tenant, with photos checked and the address confirmed.
- **Traffic:** r/columbia, r/nyc_sublets, Columbia housing groups, and the blog's scam section.

### 2. `/summer`: "Your summer sublet in NYC, checked before you pay."

- **Who it's for:** out-of-town interns and incoming students who need 10 to 12 weeks and can't tour in person, often with a parent co-paying.
- **The pain:** "It is too far away to just swing by for a visit" (r/Scams).
- **The promise:** real summer sublets with exact dates, each seen in person by someone on our team (our Wizard of Oz piece).
- **Traffic:** r/movingtoNYC, intern and admitted-student groups, and the blog's out-of-town section.

### 3. `/together`: "Find a sublet for two, with dates that work for both of you."

- **Who it's for:** two students looking for a sublet together, like persona Theo, who needs a fall room for himself and a friend near campus.
- **The pain:** most sublets fit one person, and matching two sets of dates and budgets means twice the messages. "The only thing i'm worried about with subletting is that i won't be able to get the right dates and/or my roommate won't be able to live with me" (r/nyu).
- **The promise:** one search for both of you: only sublets that sleep two and cover both of your dates, with the rent shown as each person's share.
- **Why it matters:** it pairs with the "Subletting with a friend?" share card on `/thanks`, so each signup has a reason to bring a second one.
- **Traffic:** r/columbia, class group chats, roommate groups, and the share links from `/thanks`.

### Blog: "How to Find Your Dream Sublet in NYC"

Not a landing page. It's a real guide people would read even if Gable didn't exist, and it's the "one blog post" in our demand strategy. Two sections link to the matching landing page (`/verified`, `/summer`) with `utm_source=blog`, and it ends with the waitlist form, saved with `page=blog`. On the demo site those links run searches instead and it ends with "Start a search." Unlike the landing pages, it links out to sources like HPD Online.

## Production and staging

- **Production** (gable-one.vercel.app, from `main`) is the waitlist: the pages above, the blog and `/thanks`. Link to it in every post.
- **Staging** (from the `staging` branch, with `NEXT_PUBLIC_GABLE_MODE=demo`) is the MVP demo: search, sign-in and favorites. It reads like the working product, so it has no early-access wording: no Get early access or How we verify buttons, no waitlist forms, and `/verified`, `/summer` and `/together` redirect home. Browse links and blog links run searches. Use it for demos only. It isn't tracked in GA and isn't indexed.

## How it's built

- Shared pieces live in `src/components/landing/`: `ChatHero` (chat box, chips, signup popup), `SignupForm`, `SiteChrome` (header and footer), and `blocks.tsx` (quotes, steps, listing cards, spot-the-scam, photo CTA). Scroll reveal is CSS-only (scroll-driven animations), so no script touches the rendered markup.
- Styles are in `src/app/landing.css`, imported once in the root layout. Tailwind is still available for new work.
- Photos are hotlinked from Pexels through `px()` in `Photo.tsx`. Example listings and people are labeled as illustrations.
- Old URLs (`/index.html`, `/verified.html`, `/real`, `/interns`, `/describe`, ...) redirect in `next.config.ts`.

## Signups and analytics

- Every form calls the `joinWaitlist` server action (`src/app/actions.ts`), which saves to Supabase through `src/lib/signups.ts`. Each row records `page` (`summer/intern` = page plus the hero toggle), `looking_for` (what they typed in the chat box) and UTM params.
- Production needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel, and `supabase/signups.sql` run once. In local dev, signups go to `.data/signups.jsonl`.
- GA loads in the root layout: GA4 `G-5MEBWDE6BD` in production builds, or `NEXT_PUBLIC_GA_ID` if set. The chat box sends `chat_request`; `/thanks` sends `sign_up`.
- **Sharing from `/thanks`:** every signup gets a personal link, `https://www.gable.fit/?utm_source=referral&utm_medium=share&utm_campaign=ref_<code>`, with copy, text, WhatsApp, email and share-sheet buttons. The pitch is "Subletting with a friend? We'll match the two of you to sublets for two." The code comes from the email (`src/lib/referral.ts`), so nothing extra is stored and the link doesn't show the email. A friend who joins through it is saved with that `utm_campaign`. Run `npm run referrals` to list who brought whom, then match those pairs by hand. GA gets a `share` event with the method.
- Use lowercase UTMs on every link we post, e.g. `/summer?utm_source=reddit&utm_medium=post&utm_campaign=summer`.

## Honesty notes

- Payments and rent collection are worded as "we're building," not as live features.
- "Checked in person" is our Wizard of Oz piece, so someone on the team has to actually do the visits.
