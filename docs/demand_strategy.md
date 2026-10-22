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

- **Title:** How to Find Your Dream Sublet in New York City
- **Owner:** Lookman Mustapha
- **Status:** Not published yet
- **Link:** TODO, add when published
- **Outline:** How to find your dream sublet in NYC.
  - TODO: fill in the sections

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
