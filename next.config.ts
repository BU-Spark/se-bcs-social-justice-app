import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bcsfall2025.s3.us-east-2.amazonaws.com",
        //hostname: "bcs-chad-starks.s3.us-east-1.amazonaws.com",
      },
    ],
  },
  // Allow large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
