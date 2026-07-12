import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright (and other local tooling) hits the dev server via 127.0.0.1
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
