# Gable: Demand Strategy

How we get our first signups. No paid ads yet. Every link we post goes to a Gable landing page with a lowercase UTM so we can see what works in Google Analytics.

## Traffic owners

| Owner | Channel | What they do |
|---|---|---|
| Michelle Mai | Reddit | Posts and replies in the NYC housing subreddits below |
| Sam Hearst | Facebook and Instagram | Posts in NYC and school housing groups |
| Lookman Mustapha | Blog on the Gable site | Writes the blog post and links it from posts |

## Communities

Reddit, where students looking for an NYC sublet already ask for help. Several NYC subs ban self-promotion or moving questions (r/AskNYC rules 3 and 6, r/movingtoNYC), so posts with a link go to student and housing subs that allow them.

- [r/NYCapartments](https://www.reddit.com/r/NYCapartments/)
- [r/nycollegestudents](https://www.reddit.com/r/nycollegestudents/)
- [r/nyu](https://www.reddit.com/r/nyu/)
- Next: r/columbia, r/barnard, r/nyc_sublets (check each sub's rules first)

UTM format: `?utm_source=<channel>&utm_medium=<post-type>&utm_campaign=<campaign>`, all lowercase.
Example: `https://www.gable.fit/together?utm_source=reddit&utm_medium=post&utm_campaign=together`

Each post is useful on its own first, says plainly that we're students building Gable for a class project, and puts the link last. One campaign per post, so signups by `utm_campaign` tell us which promise and which community pull.

## First 3 posts (posted)

All three by Michelle Mai on October 23, 2026.

| # | Where | Promise | Post | Link to edit in |
|---|---|---|---|---|
| 1 | r/NYCapartments | Sublet for two | [post](https://www.reddit.com/r/NYCapartments/comments/1xdk7k7/students_looking_for_a_sublet_with_a_friend_how/) | `https://www.gable.fit/together?utm_source=reddit&utm_medium=post&utm_campaign=together` |
| 2 | r/nycollegestudents | Parents | [post](https://www.reddit.com/r/nycollegestudents/comments/1xdlt94/parents_helping_a_student_find_an_nyc_sublet_what/) | `https://www.gable.fit/summer?utm_source=reddit&utm_medium=post&utm_campaign=parents` |
| 3 | r/nyu | New to NYC | [post](https://www.reddit.com/r/nyu/comments/1xdm28t/students_new_to_nyc_how_did_you_pick_a/) | `https://www.gable.fit/summer?utm_source=reddit&utm_medium=post&utm_campaign=new_to_nyc` |

The posts went up with bare links (`/verified`, `/summer`, `/together`). Edit each post body to the link above so it lands on the matching page and shows up by campaign in Google Analytics. `/summer` is the closest page for parents and new-to-NYC students until those get their own pages.

### Post 1: r/NYCapartments

> **Title:** students looking for a sublet with a friend, how do you find two rooms with the same dates?
>
> When I was looking for a sublet last summer, I noticed almost every listing was for one room. If you're moving with a friend, you either find a 2BR that's gone in a day or end up in two different apartments. What seemed to help people: searching by both your dates first, splitting the budget per person upfront, and asking the lister if the second room is actually free.
>
> I'm a senior at Columbia working on Gable for a class project, and we're starting with students. Has anyone found a sublet for two? [link]

### Post 2: r/nycollegestudents

> **Title:** parents helping a student find an NYC sublet, what made you trust a listing?
>
> When I was looking for a sublet last summer, many posts I read were from parents trying to help, and one question kept coming up: how do you know it's real before you pay? What seemed to help: a live video tour, looking the building up on HPD, getting dates and rent in writing, and never paying by Zelle.
>
> I'm a senior at Columbia working on Gable for a class project, so parents can see what's been checked on a listing. We're opening to students first. Parents, what would you want to know? [link]

### Post 3: r/nyu

> **Title:** students new to NYC, how did you pick a neighborhood before you'd ever been here?
>
> When I was looking for a sublet last summer, I read a lot of posts from students moving here for the first time, and the hardest part for them was that neighborhood names meant nothing yet. What seemed to help: picking by commute to campus or work instead of vibe, checking the address on HPD, and asking on here which areas were easy to live in.
>
> I'm a senior at Columbia working on Gable for a class project, so each listing shows your commute and what's been checked. We're opening to students first. What do you wish you'd known? [link]

## Next posts (drafts)

For `/verified` and `/summer`. Post them in subs that allow links, like r/columbia or r/barnard.

### Draft A: /verified

- Where: r/columbia
- Owner: Michelle Mai
- Link: `https://www.gable.fit/verified?utm_source=reddit&utm_medium=post&utm_campaign=verified`
- Date posted: TODO
- Text:

> **Title:** student here, what helped me spot fake sublets last summer
>
> I was looking for a sublet last summer, and finding listings wasn't the hard part. Figuring out which ones were real was. Stuff that actually helped: reverse image searching the photos, looking the address up on HPD, asking for a live video tour, and never sending money before seeing a lease.
>
> I'm a senior at Columbia, and for a class project I'm working on Gable, a search that shows what's been checked on each listing. We're opening to students first, would love to know what you'd want from it: [link]

### Draft B: /summer

- Where: r/barnard
- Owner: Michelle Mai
- Link: `https://www.gable.fit/summer?utm_source=reddit&utm_medium=post&utm_campaign=summer`
- Date posted: TODO
- Text:

> **Title:** students moving to NYC for the summer, how do you find a place without seeing it first?
>
> Last summer I had to find a place in NYC without being able to see it in person, and it was honestly so stressful. What ended up helping me (mostly from reading Reddit): searching by my exact dates first, picking a neighborhood based on my commute, and getting someone local to look at it before I paid anything.
>
> I'm a college student at Columbia, and for a class project I'm building Gable to make this less of a headache for students. We're opening to students first. Any tips I missed? [link]

## Blog post

- **Title:** How to Find Your Dream Sublet in NYC (was "Dream Apartment"; Gable is sublets only for now)
- **Owner:** Lookman Mustapha
- **Status:** Live once this change is deployed.
- **Path:** `/blog/how-to-find-your-dream-sublet-in-nyc` (copy in `src/content/blog.ts`). The old `/blog/how-to-find-your-dream-apartment-in-nyc` redirects here.
- **Link:** `https://www.gable.fit/blog/how-to-find-your-dream-sublet-in-nyc?utm_source=reddit&utm_medium=post&utm_campaign=dream_sublet`
- **Outline:**
  1. Decide what you want before you open an app (exact dates first)
  2. Know what you should pay, and when: nothing before you sign, about one month's deposit, no broker, the rent-stabilized 10% cap
  3. Search at the right time, with your papers ready
  4. Pick your neighborhood by your commute
  5. Look in a few places, not twenty
  6. Figure out which listings are real (links to `/verified`)
  7. Check the building without visiting: HPD Online, bedbug history, rent stabilization
  8. Tour it like you already live there, including from out of town (links to `/summer`)
  9. Make sure the sublet is allowed
  10. Before you sign the sublease
  11. The short version: an 8-step checklist
- **How it brings signups:** each linked section goes to its landing page with `utm_source=blog&utm_medium=post&utm_campaign=dream_sublet`, and the post ends with the waitlist form (signups saved with `page=blog`).

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
