import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1024, 1280, 1440, 1600, 1920, 2048, 2560],
    imageSizes: [96, 160, 220, 320, 420, 560],
  },
  devIndicators: false,
};

export default nextConfig;
