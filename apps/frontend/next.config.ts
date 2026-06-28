import type { NextConfig } from "next";
import path from "path";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  transpilePackages: [
    "@code-legends/challenges",
    "@code-legends/shared-types",
    "@code-legends/video-providers",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "github.com", pathname: "/**" },
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "xesque.rocketseat.dev", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "ds055uzetaobb.cloudfront.net", pathname: "/**" },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }

    if (dev) {
      config.cache = false;
    }

    return config;
  },
};

export default withBundleAnalyzer(nextConfig as never);
