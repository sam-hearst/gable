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
A static site modeled on daydream.ing's "one chat" search, but for verified student sublets near Columbia.
Plain HTML, CSS and JS. No build step.

| Page | File | Value prop | Audience |
|---|---|---|---|
| Homepage | `index.html` | Find a real place near Columbia through one chat | Everyone, routes to the 3 pages below |
| Landing 1 | `verified.html` | Stop messaging scammers: every lister is a verified tenant | Current students needing a sublet |
| Landing 2 | `summer.html` | Your summer room, checked in person before you pay | Out-of-town interns, incoming students, parents |
| Landing 3 | `sublet-your-room.html` | A shortlist of verified students, not 40 strangers | Students subletting their own room |
| Thanks | `thanks.html` | Fires the GA `sign_up` key event | After any signup |

## How the email capture works

- Typing in the chat box and hitting send opens a popup. The popup asks for an email and saves what they searched for. That doubles as demand data.
- Each signup records `source` (the page), `mode` (the toggle choice), `request` (what they typed) and any UTM params.

## Before going live

1. In `app.js`, set `GA_ID` to your GA4 measurement ID. In GA, mark `sign_up` as a key event.
2. In `app.js`, set `FORM_ENDPOINT` to a free Formspree (or similar) form URL. While it's empty, the forms skip saving and go straight to the thanks page, so it works for demos.
3. These live in `public/`, so Vercel serves them at `/index.html`, `/verified.html`, `/summer.html` and `/sublet-your-room.html`.
4. Use lowercase UTMs on every link you post, e.g. `summer.html?utm_source=reddit&utm_medium=post&utm_campaign=summer`.

## Honesty notes

- Example listings and shortlist people are labeled as illustrations.
- Payments and rent collection are worded as "we're building," not as live features.
- "Checked in person" is our Wizard of Oz piece, so someone on the team has to actually do the visits.
