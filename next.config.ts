import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js otherwise appends a block of its own guidance to local tooling
  // configuration files in the working tree on every dev run. Those files are
  // local-only and are not part of this repository, so it must not write to them.
  agentRules: false,

  // Image optimisation stays off for now so that image handling does not block the
  // migration. Components still use next/image, so intrinsic width and height are
  // always emitted and no layout shift is introduced.
  images: {
    unoptimized: true,
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
