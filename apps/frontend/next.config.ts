import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "github.com",
      "raw.githubusercontent.com",
      "xesque.rocketseat.dev",
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }

    return config;
  },
};

export default nextConfig;