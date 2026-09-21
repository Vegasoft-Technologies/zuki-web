import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Next.js otherwise appends a block of its own guidance to local tooling
  // configuration files in the working tree on every dev run. Those files are
  // local-only and are not part of this repository, so it must not write to them.
  agentRules: false,

  // The recovered stylesheet is kept exactly as the production server serves it, where
  // it sits at the site root and so resolves url("images/...") against /images. The
  // bundler instead reads that as a module specifier, so it is pointed at the real file
  // here rather than by editing the stylesheet.
  turbopack: {
    resolveAlias: {
      "images/vine.svg": "./public/images/vine.svg",
    },
  },

  // Workers has no Node runtime, so Next's own image optimiser is unavailable. The
  // loader maps each request to a file generated ahead of time (npm run images:formats)
  // and the /img route picks AVIF, WebP or the original from what the browser accepts.
  // The candidate widths are exactly the generated ones (src/lib/imageVariants.ts).
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    imageSizes: [128, 256],
    deviceSizes: [384, 512, 768],
  },

  // The production host serves this redirect as a hosting rule. Keeping it in the
  // codebase means it travels with the application and cannot be lost if hosting
  // changes.
  async redirects() {
    return [
      {
        source: "/privacy.html",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// In `next dev`, gives the application the same bindings it has on Cloudflare (the R2
// cache, the queue, and later the database), simulated locally from wrangler.jsonc.
// Guarded so that a production build does not start the local runtime as well.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
