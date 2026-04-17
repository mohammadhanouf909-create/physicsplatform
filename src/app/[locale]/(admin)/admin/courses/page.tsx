import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import CourseStatusBadge from "@/components/admin/CourseStatusBadge";
import DeleteCourseButton from "@/components/admin/DeleteCourseButton";
import type { Course } from "@/types/database";

async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles(full_name)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data as unknown as Course[]) || [];
}

export default async function AdminCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const courses = await getCourses();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("courses")}</h1>
        <Link href="/admin/courses/new" className="btn-primary">
          + {t("addCourse")}
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-gray-400 mb-4">No courses yet</p>
          <Link href="/admin/courses/new" className="btn-primary inline-flex">
            {t("addCourse")}
          </Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-6 py-3 text-start font-medium">Course</th>
                <th className="px-6 py-3 text-start font-medium">Instructor</th>
                <th className="px-6 py-3 text-center font-medium">Status</th>
                <th className="px-6 py-3 text-center font-medium">Price</th>
                <th className="px-6 py-3 text-center font-medium">Created</th>
                <th className="px-6 py-3 text-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((course) => {
                const title =
                  locale === "ar" && course.title_ar
                    ? course.title_ar
                    : course.title;
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-blue-50">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl text-blue-200">
                              ⚛
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{title}</p>
                          {course.title_ar && locale === "en" && (
                            <p className="text-xs text-gray-400">
                              {course.title_ar}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {(course.instructor as any)?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <CourseStatusBadge status={course.status} />
                    </td>
                    <td className="px-6 py-3 text-center font-medium text-gray-900">
                      {course.is_free
                        ? "Free"
                        : formatPrice(course.price, course.currency)}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-400">
                      {formatDate(course.created_at, locale)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          Edit
                        </Link>
                        <DeleteCourseButton
                          courseId={course.id}
                          courseTitle={title}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}