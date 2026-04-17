import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import EnrollButton from "@/components/courses/EnrollButton";
import { formatPrice } from "@/lib/utils";
import type { Course, Section } from "@/types/database";

async function getCourse(courseId: string, userId?: string) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles(id, full_name, avatar_url),
      sections(
        id, title, title_ar, sort_order,
        lectures(id, title, title_ar, duration_seconds, is_preview, sort_order)
      )
    `
    )
    .eq("id", courseId)
    .eq("status", "published")
    .single();

  if (!course) return null;

  // Sort sections and lectures
  const sorted = {
    ...course,
    sections: (course.sections || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((s: any) => ({
        ...s,
        lectures: (s.lectures || []).sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      })),
  };

  // Check enrollment
  let isEnrolled = false;
  if (userId) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", userId)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const totalLectures = sorted.sections.reduce(
    (sum: number, s: any) => sum + (s.lectures?.length || 0),
    0
  );

  return { course: sorted as unknown as Course, isEnrolled, totalLectures };
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await getCourse(courseId, user?.id);
  if (!result) notFound();

  const { course, isEnrolled, totalLectures } = result;
  const t = await getTranslations({ locale, namespace: "courses" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const title =
    locale === "ar" && course.title_ar ? course.title_ar : course.title;
  const description =
    locale === "ar" && course.description_ar
      ? course.description_ar
      : course.description;
  const instructorName = (course.instructor as any)?.full_name;

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <div className="bg-gray-900 px-4 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold leading-snug sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-lg text-gray-300">
              {description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            {instructorName && (
              <span>
                {t("instructor")}: <span className="text-white">{instructorName}</span>
              </span>
            )}
            <span>
              {totalLectures} {t("lectures")}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Curriculum */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {t("curriculum")}
            </h2>
            <div className="space-y-3">
              {(course.sections as unknown as Section[]).map((section) => (
                <details
                  key={section.id}
                  open
                  className="rounded-xl border border-gray-100 overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between bg-gray-50 px-5 py-3 font-medium text-gray-900 hover:bg-gray-100">
                    <span>
                      {locale === "ar" && section.title_ar
                        ? section.title_ar
                        : section.title}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(section as any).lectures?.length ?? 0} {t("lectures")}
                    </span>
                  </summary>
                  <div className="divide-y divide-gray-50">
                    {((section as any).lectures || []).map((lecture: any) => (
                      <div
                        key={lecture.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300 text-sm">
                            {lecture.is_preview || isEnrolled ? "▶" : "🔒"}
                          </span>
                          <span className="text-sm text-gray-700">
                            {locale === "ar" && lecture.title_ar
                              ? lecture.title_ar
                              : lecture.title}
                          </span>
                          {lecture.is_preview && (
                            <span className="badge-blue text-xs">Preview</span>
                          )}
                        </div>
                        {lecture.duration_seconds && (
                          <span className="text-xs text-gray-400">
                            {formatDuration(lecture.duration_seconds)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Enrollment card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 card">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={title}
                  className="mb-4 w-full rounded-lg object-cover"
                  style={{ aspectRatio: "16/9" }}
                />
              )}
              <p className="text-3xl font-bold text-gray-900">
                {course.is_free
                  ? tCommon("free")
                  : formatPrice(course.price, course.currency)}
              </p>

              <EnrollButton
                courseId={course.id}
                isEnrolled={isEnrolled}
                isFree={course.is_free}
                price={course.price}
                currency={course.currency}
                locale={locale}
                userId={user?.id}
              />

              <ul className="mt-4 space-y-2 text-sm text-gray-500">
                <li>✓ {totalLectures} video lectures</li>
                <li>✓ Downloadable study materials</li>
                <li>✓ Practice exams included</li>
                <li>✓ Access on all devices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}