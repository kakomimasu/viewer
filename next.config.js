/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "img.shields.io", pathname: "/badge/*" },
      {
        protocol: "https",
        hostname: "i.imgur.com", pathname: "/*"
      }
    ],
    unoptimized: true,
  },
  experimental: {
    testProxy: true,
  },
  output: 'standalone',
}
