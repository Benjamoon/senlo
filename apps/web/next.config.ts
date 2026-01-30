import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@senlo/ui",
    "@senlo/core",
    "@senlo/editor",
    "@senlo/db",
    "@scalar/api-reference-react",
    "@scalar/nextjs-api-reference",
    "@scalar/agent-chat",
  ],

};

export default nextConfig;
