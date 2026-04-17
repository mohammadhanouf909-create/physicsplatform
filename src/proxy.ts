import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { createServerClient } from '@supabase/ssr';

// 1. إعداد ميدل وير الترجمة
const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // تنفيذ ميدل وير الترجمة أولاً
  let response = intlMiddleware(request);

  // 2. إعداد Supabase لتحديث الجلسة (Session)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // تحديث الاستجابة بالكوكي الجديدة
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // التأكد من حالة المستخدم (بمنع انتهاء السيشن)
  await supabase.auth.getUser();

  return response;
}

// 3. الكونفيج الصحيح (مرة واحدة فقط وبدون تكرار)
export const config = {
  matcher: [
    // تمكين الـ Redirect عند الدخول على "/"
    '/', 
    // تمكين اللغات
    '/(ar|en)/:path*', 
    // استبعاد ملفات النظام والصور
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};