import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // التأكد من أن اللغة مدعومة
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // جلب ملفات الترجمة
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* استخدمنا الخطوط اللي عرفتها في tailwind.config */}
      <body className={locale === 'ar' ? 'font-arabic' : 'font-sans'}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            {/* القائمة العلوية */}
            <PublicNavbar />
            
            {/* محتوى الصفحات */}
            <main className="flex-grow">
              {children}
            </main>
            
            {/* الجزء السفلي */}
            <PublicFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}