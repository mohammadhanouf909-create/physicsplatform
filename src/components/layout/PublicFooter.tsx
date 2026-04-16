import { useTranslations } from "next-intl";

export default function PublicFooter() {
  const t = useTranslations("common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-lg font-bold text-blue-700">{t("appName")}</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              منصة متخصصة في تبسيط الفيزياء والعلوم لطلابنا بأسلوب عصري ومبتكر.
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-400">
              © {year} {t("appName")}. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}