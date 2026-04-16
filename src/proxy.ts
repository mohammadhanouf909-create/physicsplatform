import createMiddleware from 'next-intl/middleware';
import {routing} from '@/i18n/routing';
export default createMiddleware(routing);

export const config = {
  // الأمر ده بيقول للموقع: طبق نظام الترجمة على كل الصفحات ماعدا الصور والملفات
  matcher: ['/', '/(ar|en)/:path*']
};