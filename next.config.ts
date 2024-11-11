import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ["public.tsx", "public.ts", "public.jsx", "public.js"],
  images: {
    domains: [
      "i.ibb.co",
      (process.env.SUPABASE_URL ?? "").replace("https://", ""),
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/pessoas",
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
};

export default nextConfig;
