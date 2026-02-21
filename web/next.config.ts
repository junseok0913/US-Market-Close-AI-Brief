import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    // Route handlers (e.g. /api/market-chart) need a runtime server.
    // Keep static export for non-dev builds, but disable it in dev/capture mode.
    ...(isDevServer ? {} : { output: "export" }),
    images: {
      unoptimized: true,
    },
    experimental: {
      viewTransition: true,
    },
  };
};

export default nextConfig;
