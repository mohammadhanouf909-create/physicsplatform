import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // بنعرف الموقع إحنا في أي لغة (ar ولا en)
  const { locale } = await params;
  
  // لو اللغة مش عربي ولا إنجليزي، طلع صفحة "غير موجود"
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // بنجيب الكلمات المترجمة من الفولدر اللي عملناه زمان (messages)
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}