# Landing pages (HW5)

Brief for the homepage and the three landing pages. Read with `brand_position.md` and `style_guide.md`. The copy itself lives in `src/content/pages.ts`, so edit it there.

## Pages

| Path | Audience | One value prop | Tests |
|---|---|---|---|
| `/` | NYC students and recent grads with a move date coming up | Tell us the place you want. We'll find it, and tell you what's real. | The core promise |
| `/describe` | Students hunting before a lease or semester date | Describe it in your own words instead of twenty filters | Search as the lead |
| `/real` | Students looking for a sublet or room | Know what's real before you go, and before you pay | Trust as the lead |
| `/interns` | Out-of-town interns and incoming grad students | Find a summer sublet you can trust without touring it | Remote trust |

The brand position says to let signups decide which promise leads. Compare `/describe` against `/real` in Google Analytics.

## Rules for every page

- One action: join the waitlist. The form asks what they're looking for (optional) and their email.
- No nav bar, no "learn more." The homepage is the only page that links to anything else.
- Social proof is real Reddit quotes with their subreddit and date. Never invent testimonials, and never put quotation marks around paraphrased interview notes.
- The example match card is labeled "Example." Gable doesn't have listings yet.
- Every signup goes to `/thanks`, which fires the `sign_up` event in Google Analytics. Mark it as a key event in GA.

## Posting links

Tag every link with lowercase UTMs, e.g. `https://<domain>/real?utm_source=reddit&utm_medium=organic&utm_campaign=hw5_real`. The form saves the UTMs with each signup.
