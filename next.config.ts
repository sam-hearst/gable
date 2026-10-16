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
      { source: "/sublet-your-room.html", destination: "/sublet-your-room", permanent: false },
      { source: "/thanks.html", destination: "/thanks", permanent: false },
      { source: "/real", destination: "/verified", permanent: false },
      { source: "/interns", destination: "/summer", permanent: false },
      { source: "/describe", destination: "/", permanent: false },
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
