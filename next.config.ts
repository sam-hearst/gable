import type { NextConfig } from "next";

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
      { source: "/sublet-your-room.html", destination: "/sublet-your-room", permanent: false },
      {
        source: "/blog/how-to-find-your-dream-apartment-in-nyc",
        destination: "/blog/how-to-find-your-dream-sublet-in-nyc",
        permanent: true,
      },
      // Both sites are the product now, so the old waitlist landing pages go home.
      { source: "/verified", destination: "/", permanent: false },
      { source: "/summer", destination: "/", permanent: false },
      { source: "/together", destination: "/", permanent: false },
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
