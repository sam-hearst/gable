// Which site this deployment is. Both sites run the full app (sidebar, search,
// favorites, messages). Staging sets NEXT_PUBLIC_GABLE_MODE=demo in Vercel and
// adds the made-up SAMPLE data: sample listings, the sample booking flow and the
// Messages mockup. Production (gable.fit) shows real data only. Unset means
// production, so a deployment without the variable never shows sample data.
export const isDemo = process.env.NEXT_PUBLIC_GABLE_MODE === "demo";

// Sample data (made-up listings, chats and Q&A) shows on staging only.
export const showSamples = isDemo;

// A link that runs a search. The demo site sends browse links straight into
// search instead of to the waitlist landing pages.
export const searchHref = (q: string) => `/search?q=${encodeURIComponent(q)}`;
