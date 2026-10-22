// Copy for the blog. Same rules as pages.ts: canonical language in, "language
// to avoid" out (docs/brand_position.md). Quotes are verbatim from our Reddit
// research. Facts about NYC rules were current as of the post's date; recheck
// them before republishing.

// A run of text inside a paragraph or list item: plain, or a link.
export type Inline = string | { text: string; href: string };

export type Block =
  | { type: "p"; text: Inline[] }
  | { type: "h2"; id: string; text: string }
  | { type: "ul"; items: Inline[][] }
  | { type: "ol"; items: Inline[][] }
  | { type: "quote"; text: string; source: string; href: string }
  // Points the reader to the landing page that matches the section they just read.
  | { type: "next"; text: string; label: string; href: string };

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
};

export const dreamApartmentPost: BlogPost = {
  slug: "how-to-find-your-dream-apartment-in-nyc",
  title: "How to Find Your Dream Apartment in NYC",
  metaDescription:
    "A plain guide to finding an NYC apartment: what to decide first, the money rules, when to search, how to tell which listings are real, and what to check before you sign.",
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
  readMinutes: 9,
  intro: [
    [
      "Your dream apartment in New York probably isn’t the one with the best photos. It’s the one that fits your life: a commute you don’t dread, a rent you can carry without stress, a landlord who answers, and a lease that says what you were told.",
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
        ["**Your move-in date,** and how flexible it is. A week either way opens up a lot more places."],
        ["**Your real budget,** including utilities, internet, and the deposit you’ll pay up front."],
        ["**Where you need to get to,** every day. Work, campus, the gym. Write down the commute you’d accept, in minutes."],
        ["**Your three must-haves.** Only three. Laundry in the building, a dog, a second bedroom, light."],
        ["**Your nice-to-haves.** Everything else goes here, so you can trade them off later."],
      ],
    },
    {
      type: "p",
      text: [
        "If you can say it in one sentence, like “quiet 1-bedroom near the 1 train, under $3,000, with laundry, from January 1,” you’re ready. That sentence is your search. Every listing either fits it or it doesn’t.",
      ],
    },

    { type: "h2", id: "money", text: "2. Know the money rules before you apply" },
    {
      type: "p",
      text: [
        "NYC has its own rules for what a landlord can ask for. Knowing them keeps you from overpaying and helps you spot a bad deal fast.",
      ],
    },
    {
      type: "ul",
      items: [
        ["**The 40x rule.** Most landlords want your yearly income to be about 40 times the monthly rent. For a $2,500 apartment, that’s $100,000 a year."],
        ["**Guarantors.** If you don’t meet 40x (most students don’t), landlords usually ask for a guarantor earning about 80 times the rent. If you don’t have one, guarantor companies will co-sign for a fee."],
        ["**Application fees are capped at $20** in New York State, and that should cover the background and credit check."],
        ["**Security deposits are capped at one month’s rent.** A landlord can’t ask for two or three months up front."],
        ["**Broker fees.** Since June 2025, NYC’s FARE Act means that if a landlord hires a broker to list an apartment, the landlord pays that broker, not you. You only pay a broker you hire yourself."],
      ],
    },
    {
      type: "p",
      text: [
        "If someone asks for a $200 application fee, three months up front, or a fee for a broker you never hired, that’s a reason to walk away, or at least to ask why.",
      ],
    },

    { type: "h2", id: "timing", text: "3. Search at the right time, with your papers ready" },
    {
      type: "p",
      text: [
        "Most NYC apartments go on the market about 30 days before they’re free. Start looking more than six weeks early and you’ll mostly see places that are gone by the time you can move. Start two to four weeks before your move-in date, and be ready to apply the same day you see something you like.",
      ],
    },
    {
      type: "p",
      text: [
        "Summer is the busiest and most expensive time, because graduates and new hires all move at once. Winter is quieter, and landlords are more willing to negotiate. If your dates are flexible, a November to February move can save real money.",
      ],
    },
    {
      type: "p",
      text: ["Keep these in one folder on your phone so you can apply in minutes:"],
    },
    {
      type: "ul",
      items: [
        ["A photo ID"],
        ["Your offer letter or last two pay stubs (or your student ID and proof of aid, if you’re a student)"],
        ["Your last two bank statements"],
        ["Your most recent tax return, if you filed one"],
        ["The same set from your guarantor, if you have one"],
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
        "Before you commit, ride the commute once at the hour you’d actually take it. A 20-minute trip on the map can be 40 minutes at 8:30 a.m. with a transfer. Then walk the blocks around the apartment at night, and see if you like it.",
      ],
    },

    { type: "h2", id: "where-to-look", text: "5. Look in a few places, not twenty" },
    {
      type: "p",
      text: [
        "It’s tempting to search everywhere at once. That’s how people end up on seven sites, messaging dozens of people, and touring 30 places. Pick two or three sources that match the kind of place you need:",
      ],
    },
    {
      type: "ul",
      items: [
        ["**For a 12-month lease:** the big listing sites, plus walking around the neighborhood you want and calling the numbers on “for rent” signs. Smaller buildings often never list online."],
        ["**For a sublet or a room:** your school’s housing groups and group chats, where people have to show they’re a student to join. Ask friends of friends first. A place from somebody who knows somebody is still the best kind."],
        ["**For anything on Facebook Marketplace or open groups:** go slowly. That’s where most of the scams are."],
      ],
    },
    {
      type: "p",
      text: [
        "Set up alerts for your one-sentence search on the sites you picked, and check them every morning. Good places go in a day or two.",
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
      text: ["Rental scams in NYC follow the same pattern almost every time. Watch for these:"],
    },
    {
      type: "ul",
      items: [
        ["**They want money before you see the place.** A deposit “to hold it,” or the first month before a tour. Real landlords let you see it first."],
        ["**They want Zelle, Venmo, wire, crypto, or gift cards.** None of these can be taken back once sent. Pay by check or through a platform that protects you, and only after you’ve signed a lease."],
        ["**They can’t show it.** They’re “out of the country,” “a missionary,” or “the keys will be mailed.” If no one can open the door, there’s no apartment."],
        ["**The price is far below the area.** A $1,400 one-bedroom in the West Village isn’t a lucky find."],
        ["**The photos show up elsewhere.** Run them through a reverse image search like ", { text: "Google Lens", href: "https://lens.google.com/" }, ". Scammers copy photos from real listings."],
        ["**There’s pressure.** “Five other people want it, pay today.” Real places do go fast, but a real landlord will still wait for you to see it and sign."],
      ],
    },
    {
      type: "p",
      text: [
        "One more check: ask to see proof that the person is on the lease or owns the building, and look the address up (next section). Someone who’s real won’t mind.",
      ],
    },
    {
      type: "next",
      text: "Looking for a sublet near Columbia? Every sublet on Gable comes from a verified student tenant, with photos checked and the address confirmed.",
      label: "See how we verify listings",
      href: "/verified?utm_source=blog&utm_medium=post&utm_campaign=dream_apartment",
    },

    { type: "h2", id: "check-building", text: "7. Check the building without visiting" },
    {
      type: "p",
      text: [
        "NYC publishes a lot about its buildings, and almost nobody looks. Five minutes here can save you a year in a bad one.",
      ],
    },
    {
      type: "ul",
      items: [
        [{ text: "HPD Online", href: "https://hpdonline.nyc.gov/hpdonline/" }, " shows a building’s open housing violations and complaints (heat, hot water, mold, pests) and who the registered owner is. A long list of open violations is a warning sign."],
        ["**Ask for the bedbug history.** NYC landlords have to tell you whether the building has had bedbugs in the past year."],
        ["**Check if it’s rent stabilized.** About half of NYC rentals are. If it is, your rent increases are limited each year. You can request the apartment’s rent history from ", { text: "NY State Homes and Community Renewal", href: "https://hcr.ny.gov/" }, "."],
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
        ["Check your phone signal in every room."],
        ["Open the windows. What do you hear? Where does the light come from, and at what time of day?"],
        ["Count the outlets, and look inside the closets."],
        ["Look for signs of pests: droppings under the sink, traps in corners."],
        ["Ask a neighbor in the hallway how they like the building. People are surprisingly honest."],
      ],
    },
    {
      type: "p",
      text: [
        "**Searching from out of town?** Ask for a live video call, not a pre-recorded video, and ask them to do the checks above while you watch. Better yet, ask a friend in the city to go for you. Never pay for a place you haven’t seen, live, in some form.",
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
      label: "Find a summer room",
      href: "/summer?utm_source=blog&utm_medium=post&utm_campaign=dream_apartment",
    },

    { type: "h2", id: "before-you-sign", text: "9. Before you sign the lease" },
    {
      type: "ul",
      items: [
        ["**Read the whole lease, including the riders.** That’s where the rules about pets, guests, subletting, and moving out early are."],
        ["**Get every promise in writing.** “We’ll paint before you move in” means nothing unless it’s in the lease or an email."],
        ["**Know who pays for what.** Heat, hot water, gas, electric, internet. Ask what last winter’s bills looked like."],
        ["**Pay the landlord or management company directly,** by check or a traceable payment, and get a receipt. Never pay cash, and never pay before the lease is signed by both sides."],
        ["**Photograph everything on move-in day,** with dates. It’s how you get your deposit back."],
      ],
    },

    { type: "h2", id: "sublets", text: "10. If you’re subletting, a few extra checks" },
    {
      type: "p",
      text: [
        "Sublets are how a lot of students and interns live in NYC, and they come with their own risks, because you’re renting from a tenant, not the landlord.",
      ],
    },
    {
      type: "ul",
      items: [
        ["**Make sure the person is on the lease,** and ask whether their landlord has agreed to the sublet. In many NYC buildings the tenant has to ask the landlord in writing first. Without that, you could be asked to leave."],
        ["**Sign a written sublease** with your exact dates, the rent, the deposit, and what happens to the deposit at the end."],
        ["**If the apartment is rent stabilized,** the tenant can only charge you the legal rent, plus up to 10% if it comes furnished."],
        ["**Pin down the dates.** “Summer” isn’t a date. June 1 to August 15 is."],
      ],
    },
    {
      type: "next",
      text: "On the other side of this? If you’re leaving for a semester or the summer, Gable sends you a short list of Columbia-verified students who fit your dates, instead of 40 messages from strangers.",
      label: "Sublet your room",
      href: "/sublet-your-room?utm_source=blog&utm_medium=post&utm_campaign=dream_apartment",
    },

    { type: "h2", id: "checklist", text: "The short version" },
    {
      type: "ol",
      items: [
        ["Write your search as one sentence: dates, budget, commute, three must-haves."],
        ["Have your documents ready before you tour anything."],
        ["Start two to four weeks before your move-in date."],
        ["Pick neighborhoods by subway line, not by name."],
        ["Use two or three sources, not twenty."],
        ["Never pay before you’ve seen the place and signed a lease. Never pay by Zelle or wire."],
        ["Look up the building on HPD Online."],
        ["Tour for the things photos hide."],
        ["Get every promise in writing."],
      ],
    },
  ],
  closingHeadline: "Get early access to Gable.",
  closingBody:
    "We’re building Gable to do the hard part of this guide for you: sublets and rooms near Columbia where every lister is a verified student tenant. It’s opening to Columbia students first. Leave your email and we’ll let you know.",
};

export const blogPosts: BlogPost[] = [dreamApartmentPost];

export function findBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
