import type { NextConfig } from "next";

// Always guarantee production environment during builds and deployments on Vercel
if (process.env.VERCEL || process.env.CI || process.argv.some((a) => a.includes("build"))) {
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
