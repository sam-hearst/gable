# Gable: Demand Strategy

How we get our first signups. No paid ads yet. Every link we post goes to a Gable landing page with a lowercase UTM so we can see what works in Google Analytics.

## Traffic owners

| Owner | Channel | What they do |
|---|---|---|
| Michelle Mai | Reddit | Posts and replies in the NYC housing subreddits below |
| Sam Hearst | Facebook and Instagram | Posts in NYC and school housing groups |
| Lookman Mustapha | Blog on the Gable site | Writes the blog post and links it from posts |

## Communities

All on Reddit. These are where people looking for an NYC apartment or sublet already ask for help.

- [r/movingtoNYC](https://www.reddit.com/r/movingtoNYC/)
- [r/nyc_sublets](https://www.reddit.com/r/nyc_sublets/)
- [r/NYCapartments](https://www.reddit.com/r/NYCapartments/)

## First 3 posts

Not posted yet. Each post needs:

- **Where:** the community it goes in
- **Owner:** who posts it
- **Text:** the full post
- **Link:** the landing page it points to, with a UTM
- **Date posted:** when it went up

UTM format: `?utm_source=<channel>&utm_medium=<post-type>&utm_campaign=<campaign>`, all lowercase.
Example: `https://gable-one.vercel.app/?utm_source=reddit&utm_medium=post&utm_campaign=launch`

One post per landing page, one per subreddit, so signups by `utm_campaign` tell us which promise and which community pull. Each post is useful on its own first, says plainly that we're students building Gable, and puts the link last. Check each subreddit's self-promotion rules before posting; if links aren't allowed, post without the link and reply with it when people ask.

### Post 1

- Where: r/NYCapartments
- Owner: Michelle Mai
- Link: `https://gable-one.vercel.app/verified?utm_source=reddit&utm_medium=post&utm_campaign=verified`
- Date posted: TODO
- Text:

> **Title:** How I check if an NYC sublet listing is real before I message anyone
>
> After a lot of fake listings, here's the checklist I run now:
>
> 1. **Reverse image search the photos.** Scam listings reuse photos from old StreetEasy or Airbnb posts.
> 2. **Look the address up on HPD Online.** If the unit number doesn't exist or the building has a pile of open violations, move on.
> 3. **Ask for a live video tour.** Not a recorded one. Real tenants can walk you through in five minutes.
> 4. **Never pay before you've seen it and seen a lease.** No deposits over Zelle or Venmo to "hold" a place.
> 5. **Too cheap for the neighborhood = not real.** A $1,100 furnished room in the West Village is bait.
>
> The hardest part was never finding listings. It was figuring out which ones were real.
>
> Full disclosure: I'm one of three Columbia students building Gable. You describe the place you want in your own words, and each match says what we checked: who's behind the listing, whether they reply, whether the photos and price hold up, and the building's HPD record. We're not live yet. If you want in when it is: [link]
>
> What else do you check? I'll add it to the list.

### Post 2

- Where: r/movingtoNYC
- Owner: Michelle Mai
- Link: `https://gable-one.vercel.app/summer?utm_source=reddit&utm_medium=post&utm_campaign=summer`
- Date posted: TODO
- Text:

> **Title:** Moving to NYC for a summer internship and can't tour in person? What worked for you?
>
> Asking for my friends and for us. Every year we watch people coming in for 10 to 12 week internships try to lock in a room from another state, often with a parent paying part of it. The usual problem: it's too far away to just swing by.
>
> What I've seen work so far:
>
> - Searching by your **exact dates** first, since most summer sublets are June 1 to Aug 15 and won't flex.
> - Picking a neighborhood by **commute to the office**, not by vibe.
> - Getting **someone local to see it** before any money moves: a friend, a classmate, anyone.
> - Asking the tenant for their **lease and their landlord's OK** to sublet.
>
> We're three Columbia students building Gable for exactly this. You type something like "furnished room near Midtown, June 2 to Aug 15, under $2,000" and get a short list with why each one fits and what we checked, so the trust part works without a visit. It's early and we're starting a waitlist: [link]
>
> If you've done this before, what do you wish you'd known?

### Post 3

- Where: r/nyc_sublets
- Owner: Michelle Mai
- Link: `https://gable-one.vercel.app/sublet-your-room?utm_source=reddit&utm_medium=post&utm_campaign=sublet_your_room`
- Date posted: TODO
- Text:

> **Title:** Subletting your room for the spring or summer? How do you pick from 40 replies?
>
> Every time a friend posts their room, they get flooded with strangers: half never reply again, some are bots, and it's hard to tell who'll pay on time and leave the place in one piece.
>
> What has helped them:
>
> - Asking for a **school or work email** before a call.
> - A **15-minute video call** before saying yes.
> - **A written sublet agreement** with the dates, rent, deposit and who pays utilities.
> - Checking your **lease and getting your landlord's OK** first, so it doesn't come back on you.
>
> We're building Gable to make this easier: cover your rent while you're away by listing once and getting a short list of students (signed in with a school email) whose dates fit. You pick one. We're three Columbia students and it's early, so tell us what would make you trust it: [link]

## Blog post

- **Title:** How to Find Your Dream Apartment in NYC
- **Owner:** Lookman Mustapha
- **Status:** Written. Goes live when its pull request is merged and Vercel deploys.
- **Path:** `/blog/how-to-find-your-dream-apartment-in-nyc` (copy in `src/content/blog.ts`)
- **Link:** TODO, add once live, e.g. `https://gable-one.vercel.app/blog/how-to-find-your-dream-apartment-in-nyc?utm_source=reddit&utm_medium=post&utm_campaign=dream_apartment`
- **Outline:**
  1. Decide what you want before you open an app
  2. Know the money rules: 40x income, guarantors, the $20 application fee cap, the one-month deposit cap, the FARE Act
  3. Search at the right time, with your papers ready
  4. Pick your neighborhood by your commute
  5. Look in a few places, not twenty
  6. Figure out which listings are real (links to `/verified`)
  7. Check the building without visiting: HPD Online, bedbug history, rent stabilization
  8. Tour it like you already live there, including from out of town (links to `/summer`)
  9. Before you sign the lease
  10. If you're subletting, a few extra checks (links to `/sublet-your-room` for students listing their own room)
  11. The short version: a 9-step checklist
- **How it brings signups:** each linked section goes to its landing page with `utm_source=blog&utm_medium=post&utm_campaign=dream_apartment`, and the post ends with the waitlist form (signups saved with `page=blog`).

## Welcome email

Sent once, right after someone joins the waitlist.

**How it is sent:** signups are saved to the `signups` table in Supabase. TODO: connect a new row in that table to an email service so the welcome email sends automatically (for example, a Supabase database webhook that calls Resend).

**Subject:** Thanks for signing up for Gable

> Hi there,
>
> Thank you so much for signing up for Gable.
>
> We're three Columbia students building this from our own experience with subleasing in New York, and from talking to a lot of people about how hard it is to find a place that's actually real.
>
> We'll email you as soon as Gable is ready to use. In the meantime, just reply to this email if there's a feature you'd like us to add or if you have any questions.
>
> Michelle, Lookman, and Sam
> The Gable team
