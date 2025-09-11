import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
