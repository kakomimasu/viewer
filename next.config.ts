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
  redirects() {
    return [
      {
        source: "/rule",
        destination:
          "https://kakomimasu.notion.site/2f693dd9b9fc8030baebe5c37d2beac8",
        permanent: true,
      },
      {
        source: "/docs/tutorial/docker-compose",
        destination:
          "https://kakomimasu.notion.site/docker-compose-30b93dd9b9fc80728e8ceb7000a1c8e1",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
