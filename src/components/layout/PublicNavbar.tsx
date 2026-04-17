'use client';

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PublicNavbar() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') router.refresh();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-blue-700">
          {tCommon("appName")}
        </Link>
        
        <div className="flex items-center gap-6">
          {!loading && (
            <>
              {user ? (
                // لو مسجل دخول: يظهر زرار خروج
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  {/* تقدر تضيف كلمة "خروج" في ملف الترجمة أو تكتبها يدوي مؤقتاً */}
                  تسجيل الخروج
                </button>
              ) : (
                // لو مش مسجل: تظهر أزرار الدخول والتسجيل
                <>
                  <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
                    {t("loginLink")}
                  </Link>
                  <Link href="/signup" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                    {t("signupButton")}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}