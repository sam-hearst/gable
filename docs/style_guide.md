# STYLE_GUIDE.md Gable

**Purpose:** The look of the product, so every page feels like the same calm, trustworthy place. Written for agents: hand it to a coding agent with BRAND_POSITION.md.

**Feel:** Simple, friendly, calm. Fresh greens with warm cream and sun tones: like a sunny apartment with plants. A helpful friend who knows housing, not a tech startup.

**Reference implementation:** `preview.html` (replace with the landing page once it exists)

---

## Color

| Token | Hex | Job |
|---|---|---|
| ink | #1E2B24 | Text and rules. Deep green-black instead of pure black. |
| ink faint | #5A6A60 | Hints and meta lines. 5.6:1 on background. |
| background | #FFFCF6 | Page ground. Warm cream, not stark white. |
| accent | #2B7A4B | The lead green: primary buttons, the one saturated thing per screen. Cream text on it is 5.1:1. |
| accent dark | #1D5C37 | Hover, pressed states and links. 7.8:1 on background. |
| sage tint | #EAF2E6 | Cards and section backgrounds |
| warm tint | #FBE9D5 | Callouts and badges, e.g. "verified" |
| sun | #F2A65A | Small warm highlights: a badge dot, an icon detail. Ink text only on it (7.3:1). |
| terracotta | #C4622D | Decoration only, never text (4.0:1 fails). |
| error | #B3382C | Errors and alerts |

**Rules:** One saturated green per screen area. One warm color per component. No gradients. Large areas stay cream or sage tint.

---

## Type

One family: **Plus Jakarta Sans** (Google Fonts), weights 400, 500, 700.

- **Headings:** 700, sentence case, tight tracking (-0.02em). Never all caps.
- **Body:** 400, 17px, line height 1.6, lines under 65 characters.
- **Wordmark:** "Gable" set in 700, sentence case (capital G), in ink or accent green.

---

## Look and feel: sites we like, and why

| Site | What we like | What to borrow for Gable |
|---|---|---|
| **Google Maps** | Shows the map, and you can filter right on top of it | A map view of listings with filter chips above it (price, dates, room type, verified). Filters change the map instantly. |
| **Airbnb** | Friendly and easy to use as an app, led by big photos | Photo-first listing cards, plenty of white space, a warm tone. Search is one simple bar. |
| **Zillow** | Map and list side by side for housing search | Map plus a scrolling list of listings, so you can compare places and see where they are at once. |

**What Gable does differently:** it pulls listings from many places into one, so every card shows where the listing came from and whether it is verified. Trust cues (verified badge, "responds in X hours") get the warm tint, not a loud color.

**What to avoid from these sites:** Zillow's dense, ad-heavy pages and too many filters at once. Show 3-4 filters first, with the rest behind "More filters."

---

## Space and layout

- **Content width:** 880px for text pages, 1080px for listing grids
- **Section spacing:** 64px top and bottom (40px on phones)
- **Grids:** one column on phones, two from 720px, three from 1040px

---

## Components

- **Buttons:** 12px corner radius, 44px minimum height. Primary is solid accent with cream text. Secondary is cream with a 2px accent border and accent dark text.
- **Icons:** Lucide, 2px stroke. No emoji, no other icon sets.
- **Cards:** tint fill, 16px radius, no shadow, no border.
- **Lists and tables:** plain bullets, thin ink-faint rules, no zebra stripes.
- **Links:** accent dark, underlined.

---

## Imagery

- **Photos:** Pexels. Search for real rooms and real people moving in, natural light, slightly messy and lived-in.
- **Illustrations:** none for now. Use whitespace instead.
- **What to avoid:** staged stock smiles, glossy 3D renders, generic AI art, floating phone mockups.
- **Alt text:** says what is actually in the image.

---

## Accessibility floors

4.5:1 text contrast, visible focus on every control, 44px tap targets, real heading order.

---

## Never

Gradients. Sparkle or magic-wand icons. Emoji as icons. Purple. Cold gray. Stock handshakes. Words like "seamless" and "revolutionary."

---

## Logo

- **The mark:** a house outline with a keyhole inside. A gable is the triangle of a roof, so the name and the mark say the same thing. The house is the home, the keyhole is trust and getting in safely. Chosen from nine directions (A, door and key variations); older sketches are in `logo/archive/`.
- **Files:** `logo/gable-mark.svg` (main, light tile), `logo/gable-mark-green.svg` (on dark or photo backgrounds), `logo/gable-mark-onecolor.svg` (single ink color, no tile), `logo/gable-favicon.svg` (bolder, for tiny sizes), `logo/gable-lockup.svg` (mark + "Gable").
- **Colors inside the mark:** house in accent green `#2B7A4B` (or cream on green), keyhole in sun `#F2A65A`. One-color version uses ink `#1E2B24` for both.
- **Rules:** the mark sits left of the wordmark with a gap of about a quarter of the mark's width. Minimum size 24px (use the favicon file below 32px). Never recolor the keyhole, stretch the mark, or add effects.
