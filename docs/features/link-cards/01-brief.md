# Link cards: sublets found on other sites

Branch `link-cards`, started Nov 20, 2026. Status: built, waiting on the team's OK (it changes the
"real listings come only from students posting on Gable" rule in AGENTS.md).

## Why

Gable has almost no real listings yet, so most searches come back empty. Students already find sublets on
Ohana, Listings Project, Facebook groups and elsewhere. Link cards let them share those, so search has
something useful while our own supply grows, without scraping anyone.

## What it does

1. A signed-in student pastes a link on `/share-a-listing`.
2. Gable opens that one page once and reads its public link preview (Open Graph: title, image,
   description), the same thing iMessage or Slack shows for a link. No crawling.
3. Claude (or a keyword fallback) fills in rent, dates, neighborhood, room type and furnished from the
   preview. The student checks them against the listing and fixes anything missing.
4. The card is saved as `pending`. The team approves it in Supabase, like a student listing.
5. Approved cards show in search, matched on the same filters as Gable listings, in a separate
   "Elsewhere on the web" row, labeled with the site and "not checked by Gable". The button opens the
   original listing in a new tab. Cards expire after 21 days.

## Rules it keeps

- Never mixed in with checked Gable listings, and never shown as "closest options": full matches only.
- The preview image is shown from its own site, not copied to ours.
- One request per pasted link, with an identifying user agent; public addresses only (no localhost or
  private networks, rechecked on every redirect), 1 MB and 5 second caps.
- If a site asks us to stop, we stop showing its cards (delete or reject them in the Table Editor).
- Someone on the team should read each site's terms before we promote cards from it. Ohana's terms
  weren't findable online on Nov 20.

## To ship

- Team OK on the rule change.
- Run `supabase/external_listings.sql` in Supabase.
- Merge to `staging`, test sharing a real link (needs `ANTHROPIC_API_KEY`, already in Vercel, for the
  date guesses), then `main`.
