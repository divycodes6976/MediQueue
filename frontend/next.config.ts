import type { NextConfig } from "next";

const backend = (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: `${backend}/auth/:path*` },
      { source: "/patient/:path*", destination: `${backend}/patient/:path*` },
      { source: "/token/:path*", destination: `${backend}/token/:path*` },
      { source: "/queue/:path*", destination: `${backend}/queue/:path*` },
      { source: "/user/:path*", destination: `${backend}/user/:path*` },
      { source: "/admin/:path*", destination: `${backend}/admin/:path*` },
      { source: "/search/:path*", destination: `${backend}/search/:path*` },
    ];
  },
};

export default nextConfig;
