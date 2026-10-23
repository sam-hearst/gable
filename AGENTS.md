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
- Landing pages are Next.js routes (`/`, `/verified`, `/summer`, `/sublet-your-room`, `/thanks`) built from `src/components/landing/`; see `docs/landing_pages.md`.
- Search: on the homepage, sending the chat box goes to `/search?q=...`
  (`src/app/search/page.tsx`), which filters and ranks the listings in
  `src/content/listings.ts` (logic in `src/lib/search.ts`). Those are made-up
  SAMPLE listings for the demo, not real data. The other landing pages still
  open the email popup.
- Accounts and favorites: email + password sign-in at `/signin` (Supabase
  Auth, with "Confirm email" turned off so accounts work right away). Hearts on
  `/search` save to the `favorites` table (create it with
  `supabase/favorites.sql`; row level security keeps each person's saves
  private), and `/favorites` shows them on a map (Leaflet + OpenStreetMap).
  `src/proxy.ts` refreshes the sign-in session on those routes only.
- The blog post lives at `/blog/how-to-find-your-dream-apartment-in-nyc`, with its copy in `src/content/blog.ts`.

## How we work
- Framework: Feature Forge (github.com/kenxle/feature-forge). Its skills are in
  `.claude/skills/`. Start a feature with `/feature-forge`; use `/whetstone` for
  small, well-understood changes. Feature records live in `docs/features/`.
- Work on a branch, never directly on `main`. Open a pull request and get one
  teammate's review before merging.
- Keep commits small, with a message that says what changed and why.
- Ask before adding a new library, service, or paid API.
- Listing data: do not scrape any site or call an MLS or listing API until the
  team has confirmed it is allowed. The data source is still undecided (see
  diagrams/system_overview.md).
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
