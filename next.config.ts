import type { NextConfig } from "next";

// Enforce production mode on Vercel and during builds to eliminate development 404 overlay errors
if (process.env.VERCEL || process.env.CI || process.env.NODE_ENV !== "development") {
  (process.env as any).NODE_ENV = "production";
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
