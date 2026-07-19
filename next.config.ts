import type { NextConfig } from "next";

import { normalizeBasePath } from "./src/config/site-path";

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");

const nextConfig: NextConfig = {
  assetPrefix: basePath || undefined,
  basePath,
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
};

export default nextConfig;
