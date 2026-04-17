import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import PublicNavbar from "@/components/layout/PublicNavbar";
import type { Enrollment } from "@/types/database";

async function getStudentData(userId: string) {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      course:courses(
        id, title, title_ar, thumbnail_url, status,
        instructor:profiles(full_name)
      )
    `
    )
    .eq("student_id", userId)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  const { data: attempts } = await supabase
    .from("exam_attempts")
    .select("*, exam:exams(title, title_ar, passing_score)")
    .eq("student_id", userId)
    .eq("status", "graded")
    .order("submitted_at", { ascending: false })
    .limit(5);

  return {
    enrollments: (enrollments as unknown as Enrollment[]) || [],
    attempts: attempts || [],
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") redirect(`/${locale}/admin`);

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const { enrollments, attempts } = await getStudentData(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {profile?.full_name}
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="card text-center">
            <p className="text-3xl font-bold text-blue-700">
              {enrollments.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">{t("myCourses")}</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">
              {enrollments.filter((e) => e.progress_percent === 100).length}
            </p>
            <p className="mt-1 text-sm text-gray-500">{t("completed")}</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-amber-600">
              {attempts.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">{t("myExams")}</p>
          </div>
        </div>

        {/* Enrolled courses */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {t("myCourses")}
          </h2>

          {enrollments.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">{tCommon("noResults")}</p>
              <Link href="/courses" className="btn-primary mt-4 inline-flex">
                {tCommon("viewAll")}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {enrollments.map((enrollment) => {
                const course = enrollment.course as any;
                const title =
                  locale === "ar" && course?.title_ar
                    ? course.title_ar
                    : course?.title;
                return (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${course?.id}`}
                    className="card flex gap-4 hover:shadow-md transition group"
                  >
                    <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-blue-50">
                      {course?.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-blue-200">
                          ⚛
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {course?.instructor?.full_name}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">
                            {t("progress")}
                          </span>
                          <span className="text-xs font-medium text-gray-600">
                            {Math.round(enrollment.progress_percent)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${enrollment.progress_percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent exam results */}
        {attempts.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {t("examHistory")}
            </h2>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">
                      {t("myExams")}
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Score
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attempts.map((attempt: any) => (
                    <tr key={attempt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {locale === "ar" && attempt.exam?.title_ar
                          ? attempt.exam.title_ar
                          : attempt.exam?.title}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Math.round(attempt.score_percent ?? 0)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            attempt.passed
                              ? "badge-green"
                              : "badge-red"
                          }
                        >
                          {attempt.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}