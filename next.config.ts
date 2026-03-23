import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next/Turbopack from inferring a parent directory as the workspace root.
  // This keeps builds deterministic when multiple lockfiles exist elsewhere on disk.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
