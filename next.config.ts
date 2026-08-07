import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Route continuity with the previous static site.
  async redirects() {
    return [
      { source: "/booking.html", destination: "/book", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/partners.html", destination: "/partners", permanent: true },
      {
        source: "/privacy-policy.html",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/delete-account.html",
        destination: "/delete-account",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
