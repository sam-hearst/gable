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

### Post 1

- Where: TODO
- Owner: TODO
- Text: TODO
- Link: TODO
- Date posted: TODO

### Post 2

- Where: TODO
- Owner: TODO
- Text: TODO
- Link: TODO
- Date posted: TODO

### Post 3

- Where: TODO
- Owner: TODO
- Text: TODO
- Link: TODO
- Date posted: TODO

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
