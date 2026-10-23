import type { NextConfig } from "next";

// Ensure production environment during builds to prevent Pages router fallback
if (process.env.NODE_ENV !== "development") {
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
