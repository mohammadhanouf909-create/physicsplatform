import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBunnyEmbedUrl } from "@/lib/bunny";
import { Link } from "@/i18n/navigation";
import VideoProgressTracker from "@/components/student/VideoProgressTracker";
import MaterialsList from "@/components/student/MaterialsList";

async function getCourseForStudent(courseId: string, studentId: string) {
  const supabase = await createClient();

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, progress_percent")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (!enrollment) return null;

  // Get full course with curriculum
  const { data: course } = await supabase
    .from("courses")
    .select(`
      id, title, title_ar,
      sections(
        id, title, title_ar, sort_order,
        lectures(
          id, title, title_ar, video_bunny_id,
          duration_seconds, is_preview, sort_order,
          materials(id, title, title_ar, file_name, file_size, file_url)
        )
      )
    `)
    .eq("id", courseId)
    .single();

  if (!course) return null;

  // Get student's lecture progress
  const { data: progressRows } = await supabase
    .from("lecture_progress")
    .select("lecture_id, completed, last_position_seconds")
    .eq("student_id", studentId)
    .eq("course_id", courseId);

  const progressMap = Object.fromEntries(
    (progressRows || []).map((p: any) => [p.lecture_id, p])
  );

  // Sort sections and lectures
  const sorted = {
    ...course,
    sections: (course.sections || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((s: any) => ({
        ...s,
        lectures: (s.lectures || [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((l: any) => ({
            ...l,
            materials: (l.materials || []).sort(
              (a: any, b: any) => a.sort_order - b.sort_order
            ),
          })),
      })),
  };

  return { course: sorted, enrollment, progressMap };
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; courseId: string }>;
  searchParams: Promise<{ lecture?: string }>;
}) {
  const { locale, courseId } = await params;
  const { lecture: lectureIdParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const result = await getCourseForStudent(courseId, user.id);
  if (!result) redirect(`/${locale}/courses/${courseId}`);

  const { course, progressMap } = result;

  // Find the current lecture (from param or first available)
  const allLectures = (course.sections as any[]).flatMap(
    (s) => s.lectures || []
  );

  const currentLecture = lectureIdParam
    ? allLectures.find((l: any) => l.id === lectureIdParam)
    : allLectures[0];

  const courseTitle = course.title_ar && locale === "ar"
    ? course.title_ar
    : course.title;

  return (
    <div className="flex h-screen flex-col bg-gray-900 overflow-hidden">
      {/* Top bar */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-700 bg-gray-900 px-4">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </Link>
        <h1 className="truncate text-sm font-medium text-white">
          {courseTitle}
        </h1>
        <div className="w-20" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: curriculum */}
        <aside className="hidden w-72 flex-shrink-0 overflow-y-auto border-e border-gray-700 bg-gray-900 lg:block">
          <div className="p-3">
            {(course.sections as any[]).map((section) => (
              <div key={section.id} className="mb-4">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {locale === "ar" && section.title_ar
                    ? section.title_ar
                    : section.title}
                </p>
                <div className="space-y-0.5">
                  {(section.lectures || []).map((lecture: any) => {
                    const isActive = lecture.id === currentLecture?.id;
                    const progress = progressMap[lecture.id];
                    const isCompleted = progress?.completed;

                    return (
                      <Link
                        key={lecture.id}
                        href={`/${locale}/courses/${courseId}/learn?lecture=${lecture.id}`}
                        className={`
                          flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition
                          ${isActive
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }
                        `}
                      >
                        <span className="flex-shrink-0 text-xs">
                          {isCompleted ? "✓" : lecture.video_bunny_id ? "▶" : "📄"}
                        </span>
                        <span className="line-clamp-2 flex-1 leading-snug">
                          {locale === "ar" && lecture.title_ar
                            ? lecture.title_ar
                            : lecture.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-950">
          {currentLecture ? (
            <>
              {/* Video player */}
              {currentLecture.video_bunny_id ? (
                <div className="video-container w-full">
                  <iframe
                    key={currentLecture.id}
                    src={getBunnyEmbedUrl(currentLecture.video_bunny_id)}
                    className="absolute inset-0 h-full w-full"
                    allowFullScreen
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gray-900">
                  <p className="text-gray-500">No video for this lecture</p>
                </div>
              )}

              {/* Lecture info */}
              <div className="flex-1 bg-white px-6 py-6">
                <div className="mx-auto max-w-3xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {locale === "ar" && currentLecture.title_ar
                          ? currentLecture.title_ar
                          : currentLecture.title}
                      </h2>
                      {currentLecture.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {currentLecture.description}
                        </p>
                      )}
                    </div>

                    {/* Progress tracker */}
                    <VideoProgressTracker
                      lectureId={currentLecture.id}
                      courseId={courseId}
                      userId={user.id}
                      isCompleted={progressMap[currentLecture.id]?.completed}
                    />
                  </div>

                  {/* Materials */}
                  {currentLecture.materials?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 font-semibold text-gray-900">
                        Study Materials
                      </h3>
                      <MaterialsList
                        materials={currentLecture.materials}
                        locale={locale}
                      />
                    </div>
                  )}

                  {/* Navigation buttons */}
                  <div className="mt-8 flex gap-3">
                    {(() => {
                      const idx = allLectures.findIndex(
                        (l: any) => l.id === currentLecture.id
                      );
                      const prev = allLectures[idx - 1];
                      const next = allLectures[idx + 1];
                      return (
                        <>
                          {prev && (
                            <Link
                              href={`/${locale}/courses/${courseId}/learn?lecture=${prev.id}`}
                              className="btn-secondary"
                            >
                              ← Previous
                            </Link>
                          )}
                          {next && (
                            <Link
                              href={`/${locale}/courses/${courseId}/learn?lecture=${next.id}`}
                              className="btn-primary"
                            >
                              Next →
                            </Link>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-gray-500">No lectures available yet</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}