import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Pexels photos (see docs/style_guide.md, Imagery).
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" },
    ],
  },
  // The homepage and landing pages are static files in public/.
  // Serve public/index.html at "/" so the root URL shows our homepage.
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
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
