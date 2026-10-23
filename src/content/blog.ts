// Copy for the blog. Same rules as pages.ts: canonical language in, "language
// to avoid" out (docs/brand_position.md). Quotes are verbatim from our Reddit
// research. Facts about NYC rules were current as of the post's date; recheck
// them before republishing. Gable is sublets only for now, so the guide is too.

// A run of text inside a paragraph or list item: plain, or a link.
export type Inline = string | { text: string; href: string };

export type Block =
  | { type: "p"; text: Inline[] }
  | { type: "h2"; id: string; text: string }
  | { type: "ul"; items: Inline[][] }
  | { type: "ol"; items: Inline[][] }
  | { type: "quote"; text: string; source: string; href: string }
  // Points the reader to the landing page that matches the section they just
  // read. The demo site has no landing pages, so `demo` runs a search instead.
  | { type: "next"; text: string; label: string; href: string; demo: { label: string; q: string } };

// A Pexels photo (docs/style_guide.md, Imagery), rendered through px() in Photo.tsx.
export type BlogPhoto = {
  id: number;
  alt: string;
  photographer: string;
  pexelsUrl: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  metaDescription: string;
  author: string;
  // Founder posts, not brand posts: say who wrote it and why.
  authorBio: string;
  published: string; // ISO date
  hero: BlogPhoto;
  // Photo behind the closing signup section.
  ctaPhoto: number;
  readMinutes: number;
  intro: Inline[][];
  body: Block[];
  closingHeadline: string;
  closingBody: string;
  // The demo site's ending: a search instead of the waitlist.
  demoClosingHeadline: string;
  demoClosingBody: string;
};

const UTM = "?utm_source=blog&utm_medium=post&utm_campaign=dream_sublet";

export const dreamSubletPost: BlogPost = {
  slug: "how-to-find-your-dream-sublet-in-nyc",
  title: "How to Find Your Dream Sublet in NYC",
  metaDescription:
    "A plain guide to finding a sublet in New York: what to decide first, when to look, how to tell which listings are real, and what to check before you pay or sign.",
  author: "Lookman Mustapha",
  authorBio:
    "Lookman Mustapha is a Columbia student and one of the three people building Gable. This guide comes from our team’s interviews with students about their housing searches, and from NYC housing threads on Reddit.",
  published: "2026-10-22",
  hero: {
    id: 11872593,
    alt: "A red brick apartment building with a fire escape and potted flowers",
    photographer: "Reza Shokri",
    pexelsUrl: "https://www.pexels.com/photo/red-brick-building-with-fire-escape-staircase-11872593/",
  },
  ctaPhoto: 5928131,
  readMinutes: 8,
  intro: [
    [
      "Your dream sublet in New York probably isn’t the one with the best photos. It’s the one that fits your dates exactly, sits on a commute you don’t dread, costs what you can carry, and comes from a tenant who answers and is allowed to sublet.",
    ],
    [
      "We’re three Columbia students who have been through this search, and we’ve talked to a lot of people going through it now. Over and over, they told us the same thing: finding listings isn’t the hard part. Knowing which ones fit, and which ones are real, is. This guide is everything we wish we’d known before we started.",
    ],
  ],
  body: [
    { type: "h2", id: "decide-first", text: "1. Decide what you want before you open an app" },
    {
      type: "p",
      text: [
        "The fastest way to waste a month is to start scrolling before you know what you’re looking for. Spend 20 minutes writing it down first, in plain sentences. Answer these:",
      ],
    },
    {
      type: "ul",
      items: [
        ["**Your exact dates.** Move-in and move-out. “Summer” isn’t a date; June 1 to August 15 is. A few days of give on either end opens up a lot more places."],
        ["**Your real budget,** including utilities, internet, and the deposit you’ll pay up front."],
        ["**Where you need to get to,** every day. Work, campus, the gym. Write down the commute you’d accept, in minutes."],
        ["**What kind of space.** A private room in a shared apartment, a whole studio, or a room for you and a friend."],
        ["**Your three must-haves.** Only three. Furnished, a lister who replies fast, laundry in the building, a cat."],
      ],
    },
    {
      type: "p",
      text: [
        "If you can say it in one sentence, like “furnished room near the 1 train, June 1 to August 15, under $1,700,” you’re ready. That sentence is your search. Every listing either fits it or it doesn’t.",
      ],
    },

    { type: "h2", id: "money", text: "2. Know what you should pay, and when" },
    {
      type: "p",
      text: [
        "Sublets are less formal than leases, which is exactly why money is where people get burned. A few rules keep you out of trouble:",
      ],
    },
    {
      type: "ul",
      items: [
        ["**Nothing before you’ve seen it and signed.** No deposit “to hold it,” no first month before a tour. A written sublease comes first, then money."],
        ["**Expect about one month’s deposit.** Ask in writing how and when you get it back. A deposit of more than one month’s rent is a reason to ask questions."],
        ["**Most sublets have no broker.** You’re renting from the tenant. If someone wants a fee for a broker you never hired, walk away."],
        ["**If the apartment is rent stabilized,** the tenant can only charge you the legal rent, plus up to 10% if it comes furnished."],
        ["**Pay in a way you can trace,** like a check or a platform that protects you. Never Zelle, Venmo, wire, crypto, or gift cards to someone you haven’t met."],
      ],
    },

    { type: "h2", id: "timing", text: "3. Search at the right time, with your papers ready" },
    {
      type: "p",
      text: [
        "Most sublets go up a few weeks before they’re free, when the tenant’s plans firm up. Summer sublets tend to show up from March through May, as students lock in internships and travel. Spring semester sublets cluster around November and December. Start looking about four to six weeks before your move-in date, and be ready to say yes the day you find one that fits.",
      ],
    },
    {
      type: "p",
      text: ["Tenants pick the person who seems easiest to trust. Keep these ready to share:"],
    },
    {
      type: "ul",
      items: [
        ["A photo ID, and your student ID or offer letter"],
        ["A line about who you are and why you’re in the city (“summer intern at a bank in Midtown, quiet, no parties”)"],
        ["Your exact dates and how you’ll pay"],
        ["A reference, like a past roommate or landlord, if you have one"],
      ],
    },

    { type: "h2", id: "neighborhood", text: "4. Pick your neighborhood by your commute" },
    {
      type: "p",
      text: [
        "Don’t start with a neighborhood’s name. Start with the subway line. Find the lines that get you where you go every day, then look at every neighborhood along them. Someone working in Midtown can be just as close from Astoria or Long Island City as from the Upper West Side, often for less.",
      ],
    },
    {
      type: "p",
      text: [
        "If you can, ride the commute once at the hour you’d actually take it. A 20-minute trip on the map can be 40 minutes at 8:30 a.m. with a transfer.",
      ],
    },

    { type: "h2", id: "where-to-look", text: "5. Look in a few places, not twenty" },
    {
      type: "p",
      text: [
        "It’s tempting to search everywhere at once. That’s how people end up on seven sites, messaging dozens of people, and touring 30 places. Pick two or three:",
      ],
    },
    {
      type: "ul",
      items: [
        ["**Ask friends of friends first.** A sublet from somebody who knows somebody is still the best kind."],
        ["**Your school’s housing groups and group chats,** where people have to show they’re a student to join."],
        ["**Facebook Marketplace and open groups:** go slowly. That’s where most of the scams are."],
      ],
    },
    {
      type: "p",
      text: [
        "Write a short post of your own too, with your dates, budget, and one line about you. Tenants who are leaving often scroll the groups looking for someone like you.",
      ],
    },

    { type: "h2", id: "whats-real", text: "6. Figure out which listings are real" },
    {
      type: "quote",
      text: "the hardest part of subletting in nyc was never finding listings, it’s figuring out which ones are real",
      source: "r/NYCapartments, Apr 2026",
      href: "https://www.reddit.com/r/NYCapartments/comments/1o4bou1/_/oe8t3vv/",
    },
    {
      type: "p",
      text: ["Sublet scams in NYC follow the same pattern almost every time. Watch for these:"],
    },
    {
      type: "ul",
      items: [
        ["**They want money before you see the place.** A deposit “to hold it,” or the first month before a tour. Real tenants let you see it first."],
        ["**They want Zelle, Venmo, wire, crypto, or gift cards.** None of these can be taken back once sent."],
        ["**They can’t show it.** They’re “out of the country,” “a missionary,” or “the keys will be mailed.” If no one can open the door, there’s no sublet."],
        ["**The price is far below the area.** A $900 furnished room steps from campus isn’t a lucky find."],
        ["**The photos show up elsewhere.** Run them through a reverse image search like ", { text: "Google Lens", href: "https://lens.google.com/" }, ". Scammers copy photos from real listings."],
        ["**There’s pressure.** “Five other people want it, pay today.” Good sublets do go fast, but a real tenant will still wait for you to see it and sign."],
      ],
    },
    {
      type: "p",
      text: [
        "One more check: ask to see proof that the person is on the lease, like a lease page or a utility bill with their name and the address. Someone who’s real won’t mind.",
      ],
    },
    {
      type: "next",
      text: "Looking for a sublet near Columbia? Every sublet on Gable comes from a verified student tenant, with photos checked and the address confirmed.",
      label: "See how we verify sublets",
      href: `/verified${UTM}`,
      demo: { label: "Search verified sublets", q: "Sublet near Columbia, lister who replies" },
    },

    { type: "h2", id: "check-building", text: "7. Check the building without visiting" },
    {
      type: "p",
      text: [
        "NYC publishes a lot about its buildings, and almost nobody looks. Five minutes here can save you a summer in a bad one.",
      ],
    },
    {
      type: "ul",
      items: [
        [{ text: "HPD Online", href: "https://hpdonline.nyc.gov/hpdonline/" }, " shows a building’s open housing violations and complaints (heat, hot water, mold, pests) and who the registered owner is. A long list of open violations is a warning sign."],
        ["**Ask about bedbugs.** NYC landlords have to disclose the building’s bedbug history from the past year, so the tenant can ask theirs if they don’t know."],
        ["**Check if it’s rent stabilized.** About half of NYC rentals are, and it caps what the tenant can charge you. The tenant can request the apartment’s rent history from ", { text: "NY State Homes and Community Renewal", href: "https://hcr.ny.gov/" }, "."],
        ["**Look at it on Street View.** It takes a minute, and it tells you whether the building in the photos is the building at the address."],
      ],
    },

    { type: "h2", id: "tour", text: "8. Tour it like you already live there" },
    {
      type: "p",
      text: [
        "Photos are taken on the best day with the widest lens. When you tour, check the things photos hide:",
      ],
    },
    {
      type: "ul",
      items: [
        ["Turn on the shower and the kitchen tap. Is the water pressure OK, and how long does hot water take?"],
        ["Check your phone signal in your room."],
        ["Open the window. What do you hear? Where does the light come from?"],
        ["Meet the roommates if there are any. You’ll share a kitchen with them for months."],
        ["Look for signs of pests: droppings under the sink, traps in corners."],
      ],
    },
    {
      type: "p",
      text: [
        "**Searching from out of town?** Ask for a live video call, not a pre-recorded video, and ask the tenant to do the checks above while you watch. Better yet, ask a friend in the city to go for you. Never pay for a place you haven’t seen, live, in some form.",
      ],
    },
    {
      type: "quote",
      text: "It is too far away to just swing by for a visit.",
      source: "r/Scams, Mar 2026",
      href: "https://www.reddit.com/r/Scams/comments/1rndpst/how_to_protect_against_rental_scams_for_remote/",
    },
    {
      type: "next",
      text: "Coming to NYC for a summer internship or as an incoming student? Gable has 10 to 12 week sublets near Columbia with exact dates, and someone on our team sees every place in person, so you don’t have to fly in first.",
      label: "Find a summer sublet",
      href: `/summer${UTM}`,
      demo: { label: "Search summer sublets", q: "Summer sublet near Columbia for my internship, June to August" },
    },

    { type: "h2", id: "allowed", text: "9. Make sure the sublet is allowed" },
    {
      type: "p",
      text: [
        "You’re renting from a tenant, not the landlord. If the landlord never agreed, you could be asked to leave mid-stay, even if you paid.",
      ],
    },
    {
      type: "ul",
      items: [
        ["**Make sure the person is on the lease.** Ask to see it."],
        ["**Ask whether the landlord has agreed in writing.** In many NYC buildings the tenant has to ask the landlord first, and the landlord can’t say no without a good reason. Ask to see the approval."],
        ["**Check how long the tenant is gone.** They should be coming back. Someone “subletting” a place they’ve already left for good is a warning sign."],
      ],
    },

    { type: "h2", id: "before-you-sign", text: "10. Before you sign the sublease" },
    {
      type: "ul",
      items: [
        ["**Get a written sublease** with your exact dates, the rent, the deposit, who pays which utilities, and when you get the deposit back."],
        ["**Get every promise in writing.** “The room will be cleared out before you move in” means nothing unless it’s in the sublease or a text."],
        ["**Pay the tenant in a traceable way** and get a receipt. Never pay before both of you have signed."],
        ["**Photograph everything on move-in day,** with dates. It’s how you get your deposit back."],
      ],
    },

    { type: "h2", id: "checklist", text: "The short version" },
    {
      type: "ol",
      items: [
        ["Write your search as one sentence: exact dates, budget, commute, three must-haves."],
        ["Start four to six weeks before your move-in date."],
        ["Pick neighborhoods by subway line, not by name."],
        ["Use two or three sources, not twenty, and post your own ask."],
        ["Never pay before you’ve seen the place and signed. Never pay by Zelle or wire."],
        ["Look up the building on HPD Online."],
        ["Make sure the tenant is on the lease and the landlord said yes."],
        ["Get a written sublease, and get every promise in writing."],
      ],
    },
  ],
  closingHeadline: "Get early access to Gable.",
  closingBody:
    "We’re building Gable to do the hard part of this guide for you: sublets near Columbia where every lister is a verified student tenant. It’s opening to Columbia students first. Leave your email and we’ll let you know.",
  demoClosingHeadline: "Find your sublet.",
  demoClosingBody:
    "Gable does the hard part of this guide for you: tell it your dates and budget, and see the sublets that fit, with what we checked about each one.",
};

export const blogPosts: BlogPost[] = [dreamSubletPost];

export function findBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
