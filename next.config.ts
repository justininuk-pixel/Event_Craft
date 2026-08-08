import path from "node:path";
import type { NextConfig } from "next";

// next.config.ts may be evaluated as ESM (no __dirname), so derive the project root from cwd,
// which Next always sets to the directory containing this config.
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  // These ship native (non-ECMAScript) bindings that cannot be placed in ESM chunks.
  // Without opting them out of bundling, `next build` fails with
  // "non-ecmascript placeable asset" on @resvg/resvg-js.
  serverExternalPackages: ["@resvg/resvg-js", "sharp", "music-metadata"],

  // A stray package-lock.json in a parent directory (C:\Users\Justin) made Next infer the
  // wrong workspace root. Pin it to this project so module resolution and file watching
  // stay scoped correctly.
  turbopack: {
    root: projectRoot,
  },

  images: {
    remotePatterns: [
      // Supabase Storage public bucket, where uploaded card photos are served from.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
