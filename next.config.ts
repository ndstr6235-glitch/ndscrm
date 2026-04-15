import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  },
  // pdf-lib + fontkit must be loaded from node_modules at runtime — Next.js
  // bundling/tree-shaking breaks PDFDocument.create on Vercel ("a.create is
  // not a function" after minification).
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit"],
  outputFileTracingIncludes: {
    "/*": [
      "./public/prezentace-nodistar.pdf",
      "./public/fonts/*.ttf",
      "./src/lib/fonts/*.ttf",
    ],
  },
};

export default nextConfig;
