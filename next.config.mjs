import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // يمكنك إضافة أي إعدادات أخرى هنا
};

export default withNextIntl(nextConfig);
