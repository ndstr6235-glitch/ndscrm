import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  },
  outputFileTracingIncludes: {
    "/*": [
      "./public/prezentace-nodistar.pdf",
      "./src/lib/fonts/*.ttf",
    ],
  },
};

export default nextConfig;
