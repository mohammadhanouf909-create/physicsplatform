import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { formatPrice, formatDate } from "@/lib/utils";

async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: courseCount },
    { data: payments },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("courses")
      .select("*", { count: "exact", head: true }),
    supabase.from("payments").select("amount").eq("status", "paid"),
    supabase
      .from("enrollments")
      .select(
        "*, student:profiles(full_name, email), course:courses(title, title_ar)"
      )
      .order("enrolled_at", { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = (payments || []).reduce(
    (sum: number, p: any) => sum + Number(p.amount),
    0
  );

  return {
    studentCount: studentCount || 0,
    courseCount: courseCount || 0,
    totalRevenue,
    recentEnrollments: recentEnrollments || [],
  };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const { studentCount, courseCount, totalRevenue, recentEnrollments } =
    await getAdminStats();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("dashboard")}</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-500">{t("totalStudents")}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {studentCount.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">{t("totalCourses")}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{courseCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">{t("totalRevenue")}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {t("recentEnrollments")}
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-6 py-3 text-start font-medium">Student</th>
              <th className="px-6 py-3 text-start font-medium">Course</th>
              <th className="px-6 py-3 text-start font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentEnrollments.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  No enrollments yet
                </td>
              </tr>
            ) : (
              recentEnrollments.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-900">
                      {e.student?.full_name}
                    </p>
                    <p className="text-xs text-gray-400">{e.student?.email}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {locale === "ar" && e.course?.title_ar
                      ? e.course.title_ar
                      : e.course?.title}
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {formatDate(e.enrolled_at, locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}