import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import CourseCard from "@/components/courses/CourseCard";
import type { Course } from "@/types/database";

async function getPublishedCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles(id, full_name, avatar_url)")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  return (data as unknown as Course[]) || [];
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "courses" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const courses = await getPublishedCourses();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">{t("title")}</h1>

        {courses.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400">{tCommon("noResults")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      <PublicFooter />
    </div>
  );
}