# System overview

First sketch, made before any code exists. Update it as decisions are made.

```mermaid
flowchart LR
    user["User<br/>(browser or phone)"] --> web["Next.js app<br/>landing page + app"]
    web --> api["API routes<br/>(Next.js server)"]
    api --> db[("Our database<br/>listings, users, saved searches")]
    api -. "OPEN QUESTION" .-> source{{"Listing data source"}}
    source -. option A .-> agg["Aggregate external sites<br/>(like Daydream)"]
    source -. option B .-> own["Build our own listings<br/>(users post directly)"]
    source -. option C .-> apis["Real estate / MLS APIs"]
```

## What's decided
- One Next.js app serves both the landing page (next week) and the product.

## What's still open
- **Where listing data comes from.** MLS access is the main blocker. Scraping
  needs a legal check before anyone builds it. A few real estate APIs were
  found and still need assessing. The team planned to decide this at the
  Thursday sync.
- Which database and hosting to use. Pick these with the first feature that
  needs stored data.
