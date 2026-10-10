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
