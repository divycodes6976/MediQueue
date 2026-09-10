import type { NextConfig } from "next";

const backend = (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/proxy/:path*", destination: `${backend}/:path*` },
      { source: "/auth/:path*", destination: `${backend}/auth/:path*` },
      { source: "/patient/:path*", destination: `${backend}/patient/:path*` },
      { source: "/token/:path*", destination: `${backend}/token/:path*` },
      { source: "/queue/:path*", destination: `${backend}/queue/:path*` },
    ];
  },
};

export default nextConfig;
