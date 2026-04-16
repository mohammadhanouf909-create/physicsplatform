import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server' // سحبنا النوع من هنا أضمن
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. استجابة مبدئية من ميدل وير اللغات
  let response = intlMiddleware(request);

  // 2. ربط سوبابيز بالميدل وير
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = intlMiddleware(request)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. تحديث الـ Session
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};