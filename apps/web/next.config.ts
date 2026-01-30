import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@senlo/ui", "@senlo/core", "@senlo/editor", "@senlo/db"],
};

export default nextConfig;
