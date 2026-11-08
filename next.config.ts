import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages.
 * The site is served from https://<user>.github.io/<repo>/, so the build sets
 * NEXT_PUBLIC_BASE_PATH=/<repo> (see .github/workflows/deploy-pages.yml).
 * Locally (npm run dev) the base path is empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
