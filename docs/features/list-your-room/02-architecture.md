# Architecture: List your room

## Summary

There's one new Supabase table, `student_listings`, plus one public Storage bucket,
`listing-photos`. Both are locked down with row level security. The browser uploads
photos straight to Storage. A server action checks the form and inserts the row.
`src/lib/search.ts` ranks any list of listings, and `/search` passes it the
samples plus the approved real listings. Real listings get their own page,
`/sublet/[id]`.

## Reconnaissance

- `src/content/listings.ts`: `SampleListing`, a hard-coded array with Pexels photo ids.
  It's used by `/listing`, `/book`, `/booked`, favorites, and `FavoritesMap`.
- `src/lib/search.ts`: `checks()` reads only price, dates, furnished, room
  type, neighborhood and sleeps. `rank()` and `search()` read `SAMPLE_LISTINGS`
  directly.
- `src/lib/supabase/server.ts`: a cookie-based server client and `getCurrentUser()`
  (from `getClaims`). `src/lib/supabase/client.ts`: the browser client.
- `supabase/favorites.sql`: the RLS pattern to follow.
- `src/proxy.ts`: sends non-demo visitors home from the MVP routes and refreshes the session.
- `next.config.ts`: `/sublet-your-room` redirects home on every site today.
- `cacheComponents` is on. Pages that read cookies or runtime params must
  render inside `<Suspense>` (see `node_modules/next/dist/docs`, dynamic routes
  with Cache Components). `/listing/[id]` prerenders the samples with
  `generateStaticParams` and caches pages after the first request. That's wrong for
  listings that can be un-approved, so real listings use a separate, fully
  dynamic route.

## Affected components

| Area | Change |
|---|---|
| `supabase/student_listings.sql` (new) | The table, checks, RLS, column grants, the bucket, and storage policies. |
| `src/lib/student-listings.ts` (new, server only) | `StudentListing` type, row → listing mapping, `getApprovedListings()`, `getStudentListing(id)`, `getMyListings()`, `createListing(form)`, validation. |
| `src/app/sublet-your-room/` (new) | Page, `actions.ts`, CSS. A client form component in `src/components/listing/`. |
| `src/app/sublet/[id]/page.tsx` (new) | The real listing page. |
| `src/lib/search.ts` | `rank()` and `search()` take the listings to search (samples by default). Types widen to `AnyListing`. |
| `src/app/search/page.tsx` | Loads approved listings next to favorites and passes them to `search()`. Updates the side note. |
| `src/components/search/ResultCard.tsx` | Renders real listings: a storage photo, a **Real listing** badge, no heart, and a link to `/sublet/[id]`. |
| `src/components/landing/SiteChrome.tsx` | Demo nav and footer get "List your room". |
| `src/proxy.ts`, `next.config.ts` | `/sublet-your-room` and `/sublet/*` are demo-only. The redirect home applies only on the waitlist site. |
| `AGENTS.md`, `diagrams/system_overview.md` | Record the decision, the setup and the review steps. |

`FavoritesMap.tsx`, `FavoritesView.tsx`, the booking flow and
`src/content/listings.ts` data don't change.

## Data contract

`student_listings`: `id uuid`, `user_id uuid` (defaults to `auth.uid()`),
`status` (`pending` | `approved` | `rejected`, default `pending`), `title`,
`description`, `neighborhood` (one of the search areas), `cross_streets`,
`room_type`, `sleeps` 1–4, `price` 300–10000, `available_from`,
`available_to` (after from), `furnished`, `photos text[]` (1–6 storage paths),
`first_name`, `school`, `contact_email`, `checked text[]` (filled in by the team),
`created_at`.

Row level security:

- Anyone can read `approved` rows. A signed-in lister can also read their own rows.
- A signed-in user can insert only their own row, with `status = 'pending'` and
  `checked = '{}'`.
- A lister can delete their own row. Users have no update policy; the team edits
  in the dashboard, which bypasses RLS.
- Column grants: `anon` can't select `contact_email` or `user_id`.

Storage bucket `listing-photos`: public read, 5 MB, JPEG, PNG or WebP. Signed-in
users can upload or delete only under `<their user id>/…`.

## Flows

**Post:** the form, on the client, uploads each photo to
`listing-photos/<uid>/<random>.<ext>`. It then calls the `submitListing` server action
with the fields and photo paths. The server re-checks the user, every field, and that
each path starts with `<uid>/`, then inserts. On success, the page shows the listing
as "Waiting for our check". If the insert fails, the action returns an error and the client
deletes the photos it just uploaded.

**Review:** the team opens the Table Editor, filters for `status = pending`,
checks the lister, fills `checked`, and sets `status`.

**Search:** `/search` loads approved rows (anon-safe columns) and calls
`search(messages, [...SAMPLE_LISTINGS, ...real])`. Ranking ties prefer real
listings. If reading fails, it logs a warning and searches the samples only.

## Alternatives

- **Upload through a server action instead of browser → Storage:** server
  action bodies are capped (1 MB by default), and phone photos are bigger.
  Direct upload with path-scoped policies is Supabase's standard pattern.
- **Reuse `/listing/[id]` for real listings:** its pages are prerendered and
  cached after the first request, so a rejected listing could stay visible.
  A separate dynamic route is simpler and safe.
- **Contact through a Gable relay or in-app messages:** better privacy, but
  it's a feature in itself. Signed-in-only email is good enough for a first
  batch of 5–10 listings from our own network.
- **Admin page:** more code and an admin-role check to get right, for a
  three-person team that already has dashboard access.

## Failure modes

| Failure | Handling |
|---|---|
| Table not created yet | Search logs a warning and shows only samples. The form shows "We couldn't save your listing", and the page still loads. |
| Photo too big, wrong type, or upload error | Checked on the client before upload; Storage enforces it too. A plain message is shown and the form keeps its values. |
| Insert fails after uploads | The client deletes the uploaded photos and shows the error. |
| Someone bypasses the form with the public key | RLS and check constraints still force `pending` and own `user_id`, and limit the fields. |
| Listing is un-approved later | `/sublet/[id]` and search read live on each request, so it disappears at once. |

## Security and privacy

- The lister's email is readable only by signed-in users (column grant), and the lister agrees to
  that on the form. Any signed-in account can still read it. That's acceptable for v1,
  and noted.
- Photo URLs in the public bucket are unguessable (random names), but a pending
  listing's photo is reachable by anyone who has its URL. Photos shouldn't contain
  personal documents; the form says not to upload the lease there, since the lease is
  checked by email.
- No service-role key in the app. Everything runs as the user through RLS.
