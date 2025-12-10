import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "img.shields.io", pathname: "/badge/*" },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/*",
      },
    ],
    unoptimized: true,
  },
  experimental: {
    testProxy: true,
  },
};

export default nextConfig;
