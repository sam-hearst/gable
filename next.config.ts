import type { NextConfig } from "next";

const isDemo = process.env.NEXT_PUBLIC_GABLE_MODE === "demo";

const nextConfig: NextConfig = {
  images: {
    // Pexels photos (see docs/style_guide.md, Imagery).
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" },
    ],
  },
  // Old URLs: the static .html landing pages and the earlier Next.js pages.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: false },
      { source: "/verified.html", destination: "/verified", permanent: false },
      { source: "/summer.html", destination: "/summer", permanent: false },
      { source: "/thanks.html", destination: "/thanks", permanent: false },
      { source: "/real", destination: "/verified", permanent: false },
      { source: "/interns", destination: "/summer", permanent: false },
      { source: "/describe", destination: "/", permanent: false },
      // Sublets only for now: the page for students listing their own room is paused.
      { source: "/sublet-your-room", destination: "/", permanent: false },
      { source: "/sublet-your-room.html", destination: "/", permanent: false },
      {
        source: "/blog/how-to-find-your-dream-apartment-in-nyc",
        destination: "/blog/how-to-find-your-dream-sublet-in-nyc",
        permanent: true,
      },
      // The demo site is the product, so its waitlist landing pages go home.
      ...(isDemo
        ? [
            { source: "/verified", destination: "/", permanent: false },
            { source: "/summer", destination: "/", permanent: false },
            { source: "/together", destination: "/", permanent: false },
          ]
        : []),
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
