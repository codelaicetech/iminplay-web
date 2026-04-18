import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a self-contained Node server at .next/standalone — required
  // for the Docker / Fargate runtime image so we don't need to ship the
  // whole node_modules tree.
  output: "standalone",

  // Allow <img> loads from the Supabase public avatars bucket.
  // We use native <img> (not next/image) in most places so this is
  // mainly belt-and-braces, but harmless.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tayyqzsuccmqdnphqdwm.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
};

export default nextConfig;
