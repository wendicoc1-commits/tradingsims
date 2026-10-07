import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '192.168.0.68',
    'localhost:3000',
    '127.0.0.1:3000',
    '*.trycloudflare.com',
  ],
};

export default nextConfig;
