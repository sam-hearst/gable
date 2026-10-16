// Copy for the homepage and landing pages. Every line here should pass the
// brand position (docs/brand_position.md): canonical language in, "language to
// avoid" out. Quotes are verbatim from our Reddit research (HW4 quotes.jsonl).
// Listings and search results are examples (labeled as such on the page):
// Gable has no live listings yet.

export type IconName =
  | "message"
  | "list"
  | "shield"
  | "calendar"
  | "pin"
  | "check"
  | "clock"
  | "image"
  | "building";

export type Quote = {
  text: string;
  source: string;
  href: string;
};

export type Photo = {
  src: string;
  alt: string;
  photographer: string;
  pexelsUrl: string;
};

export type Listing = {
  photo: Photo;
  price: string;
  title: string;
  facts: string;
  why: string;
  checked: string;
};

export type SearchDemo = {
  query: string;
  reply: string;
  listings: Listing[];
};

export type ExampleMatch = {
  title: string;
  meta: string;
  whyItFits: string;
  checks: { label: string; ok: boolean }[];
};

export type LandingContent = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  examples: string[];
  demo: SearchDemo;
  painHeading: string;
  quotes: Quote[];
  stepsHeading: string;
  steps: { icon: IconName; title: string; body: string }[];
  example: ExampleMatch;
  closingHeadline: string;
  closingBody: string;
};

function pexels(id: number, slug: string, alt: string, photographer: string): Photo {
  return {
    src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`,
    alt,
    photographer,
    pexelsUrl: `https://www.pexels.com/photo/${slug}-${id}/`,
  };
}

const photos = {
  livingCityView: pexels(2030037, "living-room-furniture-set", "A bright living room with large windows and a city view", "Zak Chapman"),
  brownstone: pexels(404173, "brown-concrete-structure-under-sunny-sky", "Brownstone row houses on a sunny Brooklyn street", "Brandon Nickerson"),
  studioLoft: pexels(6447384, "interior-modern-apartment-with-kitchen-and-bedroom", "A studio apartment with a small kitchen and a bed behind a brick partition", "Max Vakhtbovych"),
  whiteFlat: pexels(7533848, "light-apartment-with-sofa-and-kitchen", "A light apartment with a sofa, dining table, and open kitchen", "Max Vakhtbovych"),
  bedroomSkyline: pexels(4091969, "gray-bed-beside-the-glass-window", "A bedroom with a big window looking out over the city", "Oliver King"),
  brickFireEscape: pexels(11872593, "red-brick-building-with-fire-escape-staircase", "A red brick apartment building with a fire escape and potted flowers", "Reza Shokri"),
  kitchen: pexels(6265836, "interior-of-kitchen-with-modern-furniture-and-appliances", "A modern kitchen with wooden counters and a living area", "Max Vakhtbovych"),
} satisfies Record<string, Photo>;

export const allPhotos: Photo[] = Object.values(photos);

const q = {
  real: {
    text: "the hardest part of subletting in nyc was never finding listings, it's figuring out which ones are real",
    source: "r/NYCapartments, Apr 2026",
    href: "https://www.reddit.com/r/NYCapartments/comments/1o4bou1/_/oe8t3vv/",
  },
  stolenPhotos: {
    text: "half the photos are stolen from streeteasy and the person wants you to wire a deposit before you even see the place",
    source: "r/NYCapartments, Apr 2026",
    href: "https://www.reddit.com/r/NYCapartments/comments/1o4bou1/_/oe8t3vv/",
  },
  fbScammers: {
    text: "facebook groups: it’s been almost entirely scammers, and only one person has even replied back to me.",
    source: "r/nyu, May 2025",
    href: "https://www.reddit.com/r/nyu/comments/1kmxk6o/why_are_95_of_facebook_group_housing_posts_scams/",
  },
  fullTimeJob: {
    text: "It really is a full time job trying to find a place in NYC.",
    source: "r/NYCapartments, Oct 2025",
    href: "https://www.reddit.com/r/NYCapartments/comments/1o4bou1/rental_and_sublet_aggregator/",
  },
  cantFilter: {
    text: "The fact you can't filter through this pages was annoying.",
    source: "r/NYCapartments, Oct 2025",
    href: "https://www.reddit.com/r/NYCapartments/comments/1o4bou1/rental_and_sublet_aggregator/",
  },
  noReply: {
    text: "I have reached out to several places that don't appear to be scams but I haven't heard anything back.",
    source: "r/NYCapartments, Apr 2026",
    href: "https://www.reddit.com/r/NYCapartments/comments/1synk84/_/oixgz5h/",
  },
  primeTarget: {
    text: "have never been to NYC before; as such, I fear I am a prime target for scams",
    source: "r/columbia, May 2024",
    href: "https://www.reddit.com/r/columbia/comments/1cpwev9/incoming_grad_student_is_offcampus_housing/",
  },
  tooFar: {
    text: "It is too far away to just swing by for a visit.",
    source: "r/Scams, Mar 2026",
    href: "https://www.reddit.com/r/Scams/comments/1rndpst/how_to_protect_against_rental_scams_for_remote/",
  },
  overInternet: {
    text: "my question is how do you arrange that over the internet without being at risk of being scammed?",
    source: "r/Scams, Mar 2026",
    href: "https://www.reddit.com/r/Scams/comments/1rndpst/_/o9646h6/",
  },
} satisfies Record<string, Quote>;

// Example searches shown as chips under the search box. Kept deliberately
// varied: who's searching, what kind of place, and what they care about.
export const exampleSearches = [
  "2-bedroom in Brooklyn for me and my dog, near the L",
  "Studio near Midtown under $2,600 with a doorman",
  "Summer sublet near Columbia, June to August",
  "3 bedrooms in Queens with a yard, near a good school",
  "Quiet 1-bedroom with lots of light and laundry in unit",
  "Room in a shared apartment under $1,500 near NYU",
];

const exampleRoom: ExampleMatch = {
  title: "Room in a 3-bedroom, W 112th St",
  meta: "$1,650/mo · Jun 1 – Aug 15 · furnished",
  whyItFits:
    "In your budget, 8 minutes to campus, and the lister says cats are OK.",
  checks: [
    { label: "Lister’s identity confirmed", ok: true },
    { label: "Usually replies within a day", ok: true },
    { label: "Photos not found elsewhere online", ok: true },
    { label: "Lease holder not confirmed yet", ok: false },
  ],
};

export const home = {
  metaTitle: "Gable · AI home search for New York",
  metaDescription:
    "Describe the home you want in your own words. Gable's AI search finds places that fit you, explains why, and tells you what's real.",
  eyebrow: "AI home search for New York",
  headline: "Describe your next home. Gable finds it.",
  subhead:
    "Tell Gable what you want the way you’d tell a friend: budget, neighborhood, pets, move-in date. It searches for you and comes back with places picked for you, why each one fits, and what we checked.",
  examples: exampleSearches,
  demo: {
    query:
      "2-bedroom in Brooklyn for me and my dog, under $3,800, near the L, lots of light",
    reply:
      "Here are 3 places that fit. I left out 14 that don’t allow dogs or are more than 10 minutes from the L.",
    listings: [
      {
        photo: photos.livingCityView,
        price: "$3,650/mo",
        title: "2 bd · Williamsburg",
        facts: "Available Nov 1 · 1 ba · laundry in building",
        why: "Dogs welcome · 4 min to Bedford Av · big south-facing windows",
        checked: "Lister and photos checked",
      },
      {
        photo: photos.brownstone,
        price: "$3,400/mo",
        title: "2 bd · Bed-Stuy brownstone",
        facts: "Available Dec 1 · 1 ba · backyard",
        why: "Dogs welcome · 7 min to the L at Halsey · shared backyard",
        checked: "Building record checked",
      },
      {
        photo: photos.whiteFlat,
        price: "$3,780/mo",
        title: "2 bd · East Williamsburg",
        facts: "Available Nov 15 · 1 ba · dishwasher",
        why: "Dogs under 50 lb · 3 min to Montrose Av · corner unit, light all day",
        checked: "Lister replies within a day",
      },
    ],
  } satisfies SearchDemo,
  how: {
    heading: "How Gable works",
    describe: {
      title: "Describe it",
      body: "Say what you want in your own words. No filters to set.",
    },
    picked: {
      title: "Get places picked for you",
      body: "Gable reads what you said and shows only the places that fit.",
    },
    refine: {
      title: "Refine by chatting",
      body: "Change your mind? Just say so, and the list updates.",
    },
    checked: {
      title: "See what’s real",
      body: "Every place shows who listed it and what we checked.",
    },
  },
  closingHeadline: "Tell Gable what you’re looking for.",
  closingBody:
    "Gable is opening in New York soon. Describe your next home and we’ll email you when your matches are ready. Searching is free.",
};

export const landingPages: LandingContent[] = [
  {
    slug: "describe",
    metaTitle: "Gable · Describe it in your own words",
    metaDescription:
      "Stop translating your search into twenty filters. Tell Gable what you want and get a short list of NYC places that fit.",
    eyebrow: "For anyone with a move date coming up",
    headline: "Describe your next place in your own words.",
    subhead:
      "You already know what you want. Tell Gable once, and it shows you the few places that actually fit, not five hundred you have to dig through.",
    examples: exampleSearches,
    demo: {
      query:
        "Quiet 1-bedroom with lots of light and laundry in unit, under $3,200, from Jan 1",
      reply:
        "Here are 3 places that fit. I skipped ground-floor units and anything on a busy avenue.",
      listings: [
        {
          photo: photos.bedroomSkyline,
          price: "$3,150/mo",
          title: "1 bd · Long Island City",
          facts: "Available Jan 1 · 12th floor · washer/dryer",
          why: "Laundry in unit · floor-to-ceiling windows · quiet side street",
          checked: "Lister and photos checked",
        },
        {
          photo: photos.kitchen,
          price: "$2,950/mo",
          title: "1 bd · Astoria",
          facts: "Available Dec 15 · 4th floor · washer/dryer",
          why: "Laundry in unit · faces the courtyard, not the street",
          checked: "Building record checked",
        },
        {
          photo: photos.whiteFlat,
          price: "$3,100/mo",
          title: "1 bd · Greenpoint",
          facts: "Available Jan 1 · top floor · washer/dryer",
          why: "Laundry in unit · top floor, nobody above you",
          checked: "Lister replies within a day",
        },
      ],
    },
    painHeading: "Sound familiar?",
    quotes: [q.fullTimeJob, q.cantFilter, q.noReply],
    stepsHeading: "One search, said your way",
    steps: [
      {
        icon: "message",
        title: "Say what you want",
        body: "“Laundry in the building, near the 1 train, under $3,000.” That’s the whole search.",
      },
      {
        icon: "calendar",
        title: "Your exact dates",
        body: "Move-in date, number of rooms, furnished or not. Built in, not buried.",
      },
      {
        icon: "list",
        title: "Refine by talking",
        body: "“Cheaper.” “Closer to the 1.” The list updates, with why each place fits.",
      },
    ],
    example: exampleRoom,
    closingHeadline: "Tell Gable what you’re looking for.",
    closingBody:
      "Gable is opening in New York soon. We’ll email you when your matches are ready. Searching is free.",
  },
  {
    slug: "real",
    metaTitle: "Gable · Know what’s real before you pay",
    metaDescription:
      "Every NYC place on Gable shows who's behind it, whether they reply, and what we checked, so you know what's real before you go.",
    eyebrow: "For anyone looking for a sublet or room",
    headline: "Know what’s real before you go, and before you pay.",
    subhead:
      "Finding listings isn’t the hard part. Figuring out which ones are real is. Every place Gable finds for you shows what we checked, and what we couldn’t.",
    examples: [
      "Summer sublet near Columbia, June to August",
      "Room in a shared apartment under $1,500 near NYU",
      "Furnished room in Manhattan for 3 months",
      "Sublet in Brooklyn that allows cats, from Feb 1",
    ],
    demo: {
      query: "Summer sublet near Columbia, June to August, under $1,800",
      reply:
        "Here are 3 places that fit. I hid 9 listings with stolen photos or a lister who asked for Zelle.",
      listings: [
        {
          photo: photos.brickFireEscape,
          price: "$1,650/mo",
          title: "Room · Morningside Heights",
          facts: "Jun 1 – Aug 15 · furnished · 3 roommates",
          why: "Your dates exactly · 8 min to campus",
          checked: "Lister’s identity confirmed",
        },
        {
          photo: photos.studioLoft,
          price: "$1,780/mo",
          title: "Studio · Upper West Side",
          facts: "Jun 1 – Aug 31 · furnished",
          why: "Whole place to yourself · on the 1 train",
          checked: "Photos not found elsewhere",
        },
        {
          photo: photos.bedroomSkyline,
          price: "$1,500/mo",
          title: "Room · Hamilton Heights",
          facts: "May 28 – Aug 20 · furnished",
          why: "Under budget · 12 min to campus",
          checked: "Building record checked",
        },
      ],
    },
    painHeading: "What people keep running into",
    quotes: [q.real, q.stolenPhotos, q.fbScammers],
    stepsHeading: "What we check on every listing",
    steps: [
      {
        icon: "check",
        title: "Who’s behind it",
        body: "We confirm who the lister is, and ask for proof they’re on the lease.",
      },
      {
        icon: "clock",
        title: "Whether they reply",
        body: "See when the lister was last active and how fast they usually answer.",
      },
      {
        icon: "image",
        title: "Whether it holds up",
        body: "We flag photos that show up elsewhere online and prices far below the area.",
      },
    ],
    example: exampleRoom,
    closingHeadline: "Pay through Gable, never Zelle.",
    closingBody:
      "For listings posted on Gable, deposits and rent go through us. Gable is opening in New York soon. Join and we’ll email you when it opens.",
  },
  {
    slug: "interns",
    metaTitle: "Gable · Find an NYC sublet from out of town",
    metaDescription:
      "Moving to NYC for an internship, a new job, or school? Find a place that fits your dates, and see what we checked, without touring it first.",
    eyebrow: "For anyone moving to NYC from out of town",
    headline: "Find your NYC place before you land.",
    subhead:
      "You can’t tour from another city, and a hotel for months isn’t an option. Tell Gable your dates and budget, and see what we checked about every place.",
    examples: [
      "Furnished room for my internship, June to August, near Midtown",
      "1-bedroom near Downtown Brooklyn for a new job, from March",
      "Sublet for 4 months near NYU, starting in September",
      "Furnished studio in Manhattan, month to month",
    ],
    demo: {
      query:
        "Furnished room for my internship, June 2 to Aug 22, under $1,700, near Midtown",
      reply:
        "Here are 3 places that match your exact dates. Each one has a lister we could confirm.",
      listings: [
        {
          photo: photos.studioLoft,
          price: "$1,580/mo",
          title: "Room · Hell’s Kitchen",
          facts: "Jun 1 – Aug 25 · furnished",
          why: "Covers your dates · 10 min walk to Midtown",
          checked: "Lease holder confirmed",
        },
        {
          photo: photos.brickFireEscape,
          price: "$1,450/mo",
          title: "Room · Upper West Side",
          facts: "Jun 1 – Aug 31 · furnished",
          why: "Under budget · 15 min to Midtown on the 1",
          checked: "Building record checked",
        },
        {
          photo: photos.kitchen,
          price: "$1,690/mo",
          title: "Room · Long Island City",
          facts: "May 30 – Aug 22 · furnished",
          why: "Your end date exactly · one stop to Midtown",
          checked: "Photos not found elsewhere",
        },
      ],
    },
    painHeading: "If you’re searching from out of town",
    quotes: [q.primeTarget, q.tooFar, q.overInternet],
    stepsHeading: "Built for searching from far away",
    steps: [
      {
        icon: "calendar",
        title: "Your exact dates",
        body: "Three-month terms and odd start dates are the point, not an afterthought.",
      },
      {
        icon: "building",
        title: "Checks you can’t do from home",
        body: "We look up the building’s record with the city and whether the lister replies.",
      },
      {
        icon: "pin",
        title: "Sorted before your flight",
        body: "Compare a short list with what we checked, and decide without a visit.",
      },
    ],
    example: {
      ...exampleRoom,
      title: "Furnished room in a 2-bedroom, W 108th St",
      meta: "$1,580/mo · Jun 2 – Aug 22 · furnished",
      whyItFits:
        "Matches your exact dates, in your budget, and 25 minutes to Midtown on the 1.",
      checks: [
        { label: "Lister’s identity confirmed", ok: true },
        { label: "Lease holder confirmed", ok: true },
        { label: "Building: no open city housing violations", ok: true },
        { label: "Photos not checked yet", ok: false },
      ],
    },
    closingHeadline: "Sort out housing before you land.",
    closingBody:
      "Gable is opening in New York soon. Join and we’ll email you when your matches are ready.",
  },
];

export function findLandingPage(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}
