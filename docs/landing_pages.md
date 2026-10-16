# Landing pages (HW5)

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
