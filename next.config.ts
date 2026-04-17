import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.b-cdn.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "frame-src https://iframe.mediadelivery.net https://video.bunnycdn.com",
              "img-src 'self' data: blob: https://*.b-cdn.net https://*.supabase.co",
              "media-src 'self' blob: https://*.b-cdn.net",
              "connect-src 'self' https://*.supabase.co https://video.bunnycdn.com wss://*.supabase.co",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;