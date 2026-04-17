"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";

interface AdminSidebarProps {
  locale: string;
  role: string;
  userName: string;
  userEmail: string;
}

export default function AdminSidebar({
  locale,
  role,
  userName,
  userEmail,
}: AdminSidebarProps) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const navItems = [
    { href: "/admin", label: t("dashboard"), icon: "▦" },
    { href: "/admin/courses", label: t("courses"), icon: "🎓" },
    { href: "/admin/students", label: t("students"), icon: "👥" },
    { href: "/admin/exams", label: t("exams"), icon: "📝" },
    { href: "/admin/reports", label: t("reports"), icon: "📊" },
    ...(role === "admin"
      ? [{ href: "/admin/settings", label: t("settings"), icon: "⚙️" }]
      : []),
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function switchLocale() {
    const next = currentLocale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: next });
  }

  return (
    <aside className="flex w-60 flex-col border-e border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-100 px-5">
        <Link href="/" className="text-base font-bold text-blue-700">
          Physics Academy
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: user + locale + logout */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        {/* Locale toggle */}
        <button
          onClick={switchLocale}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
        >
          <span className="text-base leading-none">🌐</span>
          {currentLocale === "en" ? "عربي" : "English"}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            {getInitials(userName || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {userName}
            </p>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
        >
          <span className="text-base leading-none">→</span>
          Logout
        </button>
      </div>
    </aside>
  );
}