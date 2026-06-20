import type { NextConfig } from "next";

import "./src/shared/config/env";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
