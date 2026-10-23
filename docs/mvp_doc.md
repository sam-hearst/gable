# Gable MVP

What we're launching first, and what we haven't decided yet.

Every item has one label:

- **In scope:** part of this launch. We're building it or it's built.
- **Later:** we want it, but not for this launch.
- **Undecided:** an open question. Not a promise to users or to each other.

## What the MVP proves

A university student in NYC will describe the place they want in their own words, trust a short list of places with what we checked about each one, and ask to book one.

## 1. Audience

| Item | Label | Notes |
|---|---|---|
| NYC university students (Columbia, NYU, and other schools) | In scope | Columbia is where we start, but the wording says NYC students, not Columbia only. |
| Anyone else searching in NYC | Later | The brand is for everyone in NYC; the launch is students first. |
| Requiring a `.edu` email to sign up | Undecided | Today the waitlist and sign-in accept any email. Requiring `.edu` proves someone is a student, but blocks grad students on personal emails, incoming students, and interns from other schools. Options: require `.edu` to sign in, or accept any email and show a "student verified" badge only for `.edu`. |

## 2. First user flow: search → listing → booking

| Step | Label | Notes |
|---|---|---|
| Search: type what you want in your own words | In scope | Built. Claude reads the request and turns it into filters (budget, dates, furnished, room type, neighborhood, roommate). A keyword parser takes over if Claude is slow or down. |
| Updated side search UI | In scope | The team picked the cleaner side layout. Being added to the site now. |
| Short list of results, with the closest options when nothing fits exactly | In scope | Built. |
| Listing page: photos, price, dates, and what we checked | In scope | Not built yet. Today results only show as cards in search and favorites. |
| Booking page: "I want this place" | In scope | A form that saves the request. The team follows up by email (Wizard of Oz). |
| Book directly vs. a short interview with the lister first | Undecided | Direct is faster for renters. An interview is what student subletters told us they want, so they can pick from a few people instead of 40. The booking page should say "request" until we decide. |
| Sign in, heart listings, and see favorites on a map | In scope | Built. |
| Paying rent or deposits through Gable | Later | Copy says "we're building," never that it's live. |
| Messaging between renters and listers inside Gable | Later | |

## 3. Waitlist and welcome email

| Item | Label | Notes |
|---|---|---|
| Waitlist signup saved with page, UTM, and what they typed | In scope | Built. Saves to the `signups` table in Supabase. |
| Welcome email sent automatically after signup | In scope | Not built. Nothing in the code sends email yet. See "How the welcome email gets sent" below. |
| Sending the welcome email by hand until it's automatic | In scope | Stopgap: one person checks Supabase each day and emails new signups from the team Gmail. |
| Follow-up emails (launch announcement, reminders) | Later | |

**The welcome email**

Subject: Thanks for signing up for Gable

> Hi there,
>
> Thank you so much for signing up for Gable.
>
> We're three Columbia students building this from our own experience with subletting in New York, and from talking to a lot of people about how hard it is to find a place that's actually real.
>
> We're still getting our search to work the way we want it to. In the meantime, just reply to this email with what you're looking for (your budget, dates, and neighborhood), and one of us will personally email you places that fit.
>
> We'll also let you know as soon as Gable is ready to use.
>
> Michelle, Lookman, and Sam
> The Gable team

**How the welcome email gets sent**

1. Sign up for Resend (free for 3,000 emails a month).
2. Verify a domain we own in Resend by adding the DNS records it gives us. Without this, Resend only sends to our own address, and other emails are more likely to land in spam. This needs the custom domain (see Launch checklist).
3. After `saveSignup` succeeds in `src/app/actions.ts`, send the email through Resend. Put `RESEND_API_KEY` in Vercel's production settings.
4. Set reply-to to a team inbox someone actually reads.
5. Test it: sign up with a Gmail, a Columbia email, and an NYU email. Check that it arrives, and check the spam folder.
6. Check Resend's dashboard weekly for bounces or spam reports.

## 4. Launch checklist

| Item | Label | Notes |
|---|---|---|
| Updated side search UI on the live site | In scope | |
| NYC student wording across pages | In scope | Change "Columbia" copy to "NYC students" where it means the audience. The email fields still say `you@columbia.edu`; change them to `you@school.edu`. |
| A link ready for the Reddit posts | In scope | Done: `www.gable.fit`. Posts use lowercase UTMs. |
| Custom domain | In scope | Done: `www.gable.fit`. Next, verify it in an email service so the welcome email can send from it. |
| Test changes before they reach the live site | In scope | `main` is the live site. A `staging` branch gets its own Vercel link that only the team uses. Changes go to staging first, then merge to `main`. |
| Keep test data out of real data | In scope | Staging uses a separate Supabase project. GA should only run on the live site (`VERCEL_ENV === "production"`, not `NODE_ENV`). |
| Welcome email working (automatic or by hand) | In scope | See section 3. |

## Wizard of Oz

These are done by people behind the scenes. They should look like samples or manual checks, never like live data.

| Item | Label | Notes |
|---|---|---|
| Sample listings (32) labeled as illustrations | In scope | Until we have real listings. |
| "What we checked," done by hand | In scope | A teammate looks up HPD Online, reverse image searches the photos, and messages the lister. |
| "Checked in person" on `/summer` | In scope | Only if someone on the team actually visits. |
| Booking requests handled by email | In scope | Until we decide direct booking vs. interview. |
| Replying to welcome-email replies with places that fit | In scope | Someone checks the reply-to inbox daily and sends listings by hand while search improves. |
| Real listings from our own sublets, NYC Open Data, or RentCast | Undecided | No scraping StreetEasy, Zillow, or Facebook. |

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 and Tailwind (`sam-hearst/gable`) |
| Search | Claude Haiku on the server, keyword parser as backup |
| Data and accounts | Supabase: `signups`, `favorites`, auth |
| Email | Resend (planned) |
| Analytics | Google Analytics 4: `chat_request` and `sign_up` events |
| Hosting | Vercel: `main` = live site, `staging` = test site |

## Roles

| Owner | Builds | Owns traffic |
|---|---|---|
| Sam Hearst | The app: search, sign-in, favorites, landing pages, production and staging on Vercel | Facebook and Instagram housing groups |
| Michelle Mai | Waitlist, welcome email, MVP doc, demand strategy | Reddit posts and replies |
| Lookman Mustapha | Blog post, homework submission | The blog, linked from posts |

## What we're measuring

- Signups by landing page and `utm_campaign`: which promise pulls (real listings, summer from out of town, or sublets for two)
- Searches typed (`chat_request`) vs. visitors who leave
- Booking requests per search
- What people type, saved as `looking_for`
