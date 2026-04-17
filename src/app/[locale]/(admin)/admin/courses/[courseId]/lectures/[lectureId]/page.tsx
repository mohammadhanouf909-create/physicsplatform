import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import LectureEditorClient from "@/components/admin/LectureEditorClient";

async function getLecture(lectureId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lectures")
    .select("*, section:sections(title), course:courses(title)")
    .eq("id", lectureId)
    .single();
  return data;
}

export default async function LectureEditorPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string; lectureId: string }>;
}) {
  const { locale, courseId, lectureId } = await params;
  const lecture = await getLecture(lectureId);
  if (!lecture) notFound();

  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/courses" className="hover:text-gray-700">
          {t("courses")}
        </Link>
        <span>/</span>
        <Link
          href={`/admin/courses/${courseId}`}
          className="hover:text-gray-700 truncate max-w-xs"
        >
          {(lecture.course as any)?.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">
          {lecture.title}
        </span>
      </div>

      <LectureEditorClient lecture={lecture} courseId={courseId} locale={locale} />
    </div>
  );
}