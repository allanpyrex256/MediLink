import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "medilink.test",
    "*.medilink.test",
    "medilink.local",
    "*.medilink.local",
    "*.localhost",
  ],
  devIndicators: false,
};

export default nextConfig;
