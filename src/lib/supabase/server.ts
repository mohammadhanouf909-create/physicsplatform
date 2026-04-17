import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// العميل العادي (بصلاحيات المستخدم المسجل)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // يتم تجاهلها لو استُدعيت من Server Component
          }
        },
      },
    }
  )
}

// عميل الأدمن (بصلاحيات السوبر - Service Role)
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // تأكد أن هذا المفتاح موجود في .env.local
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // يتم تجاهلها لو استُدعيت من Server Component
          }
        },
      },
    }
  )
}