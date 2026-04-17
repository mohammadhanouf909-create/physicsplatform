import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import CourseForm from "@/components/admin/CourseForm";
import CurriculumBuilder from "@/components/admin/CurriculumBuilder";
import CourseStatusBadge from "@/components/admin/CourseStatusBadge";
import type { Course, Profile } from "@/types/database";

async function getCourseWithCurriculum(courseId: string) {
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, instructor:profiles(id, full_name)")
    .eq("id", courseId)
    .single();

  if (!course) return null;

  const { data: sections } = await supabase
    .from("sections")
    .select(
      `
      *,
      lectures(
        *,
        materials(*)
      )
    `
    )
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  // Sort lectures and materials within each section
  const sortedSections = (sections || []).map((s: any) => ({
    ...s,
    lectures: (s.lectures || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((l: any) => ({
        ...l,
        materials: (l.materials || []).sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      })),
  }));

  return { ...course, sections: sortedSections } as unknown as Course;
}

async function getInstructors(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .in("role", ["admin", "instructor"])
    .order("full_name");
  return (data as Profile[]) || [];
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  const [course, instructors] = await Promise.all([
    getCourseWithCurriculum(courseId),
    getInstructors(),
  ]);

  if (!course) notFound();

  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← {t("courses")}
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs">
            {course.title}
          </h1>
          <CourseStatusBadge status={course.status} />
        </div>
        <a
          href={`/${locale}/courses/${courseId}`}
          target="_blank"
          className="btn-secondary text-sm"
        >
          Preview ↗
        </a>
      </div>

      {/* Tabs layout: Details + Curriculum */}
      <div className="space-y-8">
        {/* Course details */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Course Details
          </h2>
          <CourseForm
            locale={locale}
            course={course}
            instructors={instructors}
          />
        </section>

        {/* Curriculum builder */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Curriculum
          </h2>
          <CurriculumBuilder
            course={course}
            locale={locale}
          />
        </section>
      </div>
    </div>
  );
}