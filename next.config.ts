import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds (useful for Docker/production builds)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds (we'll catch these in CI/dev)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
