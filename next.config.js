/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        port: "",
        pathname: `/${process.env.CONTENTFUL_SPACE_ID}/**`,
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],

  },
  experimental: {
    taint: true,
  },
};

module.exports = nextConfig;
