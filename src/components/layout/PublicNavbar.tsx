import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function PublicNavbar() {
  const t = useTranslations("auth"); // هنستخدم ترجمات auth مؤقتاً أو زود common في الـ JSON
  const tCommon = useTranslations("common");

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-blue-700">
          {tCommon("appName")}
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            {t("loginLink") || "Login"}
          </Link>
          <Link href="/signup" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
             {t("signupButton") || "Get Started"}
          </Link>
        </div>
      </div>
    </nav>
  );
}