import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CourseForm from "@/components/admin/CourseForm";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

async function getInstructors(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["admin", "instructor"])
    .order("full_name");
  return (data as Profile[]) || [];
}

export default async function NewCoursePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const instructors = await getInstructors();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/courses"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← {t("courses")}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">{t("addCourse")}</h1>
      </div>

      <CourseForm locale={locale} instructors={instructors} />
    </div>
  );
}