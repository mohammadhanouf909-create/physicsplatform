import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // السماح بصور سوبا بيز
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net', // السماح بصور مصغرات الفيديوهات من باني
      },
    ],
  },
  async headers() {
    return [
      {
        // تطبيق سياسة الحماية دي على كل صفحات الموقع
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "frame-src 'self' https://iframe.mediadelivery.net https://video.bunnycdn.com", // السماح بمشغل الفيديوهات
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

export default withNextIntl(nextConfig);