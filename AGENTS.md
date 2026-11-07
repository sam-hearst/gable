# Gable

[ Gable is a B2C app that trying to help facillitate the renting and buying space for individuals.]

## Read these first
- docs/brand_position.md: how we talk and who we serve
- docs/style_guide.md: how it looks
- diagrams/system_overview.md: how the pieces fit together, and what is still undecided

Do not write customer-facing copy or UI without reading the first two. Use the
canonical language in the brand position, avoid its "language to avoid" list,
and use only the colors and fonts in the style guide.

## How to run it
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS
- Install: `npm install`
- Run locally: `npm run dev`, then open http://localhost:3000
- Lint: `npm run lint`
- Build: `npm run build`
- Test: not set up yet. Add a test runner with the first real feature and update this line.
- Env vars (in `.env.local`, all optional locally): Google Analytics is on in
  production builds (GA4 `G-5MEBWDE6BD`, set in `src/app/layout.tsx`);
  `NEXT_PUBLIC_GA_ID` overrides it or turns it on locally; `SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` send waitlist signups to the Supabase `signups` table. Without Supabase, local dev writes
  signups to `.data/signups.jsonl`; production refuses signups until it's set.
  Create the table with `supabase/signups.sql`. `ANTHROPIC_API_KEY` lets
  `/search` read requests with Claude (server only, never `NEXT_PUBLIC_`);
  without it, or if Claude is slow or fails, search falls back to keyword
  matching. It's also set in Vercel.
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` turn on
  sign-in and favorites (public values, safe in the browser; set in Vercel
  for all environments). Without them, `/signin` says sign-in isn't set up.
- Two sites from one codebase (`src/lib/mode.ts`):
  - **Production** (`main`, gable-one.vercel.app) is the waitlist. The MVP
    routes (`/search`, `/favorites`, `/signin`, `/auth/*`) redirect to `/`,
    the homepage chat box opens the email popup, and Google Analytics is on.
  - **Staging** (the `staging` branch) sets `NEXT_PUBLIC_GABLE_MODE=demo` in
    Vercel (Preview, branch `staging` only). It shows the MVP: the chat box goes
    to `/search`, the header shows Favorites and Sign in, GA is off and search
    engines are told not to index it. It also has the demo booking flow:
    `/listing/[id]` → `/book/[id]` → `/booked/[id]` (no real payment, nothing sent).
  - Locally, add `NEXT_PUBLIC_GABLE_MODE=demo` to `.env.local` to see the demo.
  - To update staging: `git push origin main:staging` (or merge into `staging`
    first and test there before merging to `main`).
- `/thanks` has a share card with each signup's personal referral link; `npm run referrals`
  lists who brought whom (see `docs/landing_pages.md`).
- Gable is **sublets only** for now: no rooms or apartments as categories. Listings still
  say what the space is, as "Sublet · private room".
- List your room (demo site only; the team agreed Nov 5, 2026): signed-in students post a
  sublet at `/sublet-your-room` (on the waitlist site it still redirects home). It saves
  to the Supabase `student_listings` table as `pending`, with photos in the public
  `listing-photos` Storage bucket (create both with `supabase/student_listings.sql`).
  Row level security keeps pending listings visible only to their lister, and the lister's
  email visible only to signed-in users. Approved listings show in `/search` next to
  the samples with a "Real listing" badge and open at `/sublet/[id]`, where signed-in
  renters can email the lister. No booking or payment for real listings yet, and they
  can't be hearted. Feature record: `docs/features/list-your-room/`.
- Approving a listing (team, by hand): Supabase dashboard → Table Editor →
  `student_listings`. For each `pending` row, email the lister at `contact_email` to
  check they're a student and on the lease, and look at the photos (`photos` holds paths
  in the `listing-photos` bucket, under Storage). Then set `checked` to what you
  confirmed, e.g. `["Columbia email verified","Lease on file","Photos checked"]`, and
  set `status` to `approved` (or `rejected`). It shows in search right away.
- `/privacy` is the privacy policy (public on both sites, linked in the footer; Google sign-in needs it).
  When the app starts collecting something new, update it in the same pull request.
- Landing pages are Next.js routes (`/`, `/verified`, `/summer`, `/thanks`) built from `src/components/landing/`; see `docs/landing_pages.md`.
- Search: on the homepage, sending the chat box goes to `/search?q=...`
  (`src/app/search/page.tsx`), which filters and ranks the listings in
  `src/content/listings.ts` plus approved real listings
  (`src/lib/student-listings.ts`), with the logic in `src/lib/search.ts`. The ones in
  `listings.ts` are made-up SAMPLE listings for the demo. The other landing pages
  still open the email popup.
- Accounts and favorites: email + password sign-in at `/signin` (Supabase
  Auth, with "Confirm email" turned off so accounts work right away). Hearts on
  `/search` save to the `favorites` table (create it with
  `supabase/favorites.sql`; row level security keeps each person's saves
  private), and `/favorites` shows them on a map (Leaflet + OpenStreetMap).
  `src/proxy.ts` refreshes the sign-in session on those routes only.
- The blog post lives at `/blog/how-to-find-your-dream-sublet-in-nyc` (the old
  `dream-apartment` URL redirects there), with its copy in `src/content/blog.ts`.

## How we work
- Framework: Feature Forge (github.com/kenxle/feature-forge). Its skills are in
  `.claude/skills/`. Start a feature with `/feature-forge`; use `/whetstone` for
  small, well-understood changes. Feature records live in `docs/features/`.
- Work on a branch, never directly on `main`. Open a pull request and get one
  teammate's review before merging.
- Keep commits small, with a message that says what changed and why.
- Ask before adding a new library, service, or paid API.
- Listing data: do not scrape any site or call an MLS or listing API until the
  team has confirmed it is allowed. For now, real listings come only from
  students posting on `/sublet-your-room` (see diagrams/system_overview.md).
- Never commit secrets. Keys go in `.env.local`, which is gitignored.
- When you change how the project runs or is structured, update this file and
  the diagrams in the same pull request.

## Team
- Michelle Mai: Reddit research, style guide, logo
- Lookman Mustapha: persona agents, synthesis
- Sam: brand position, repo setup

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
