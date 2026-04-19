import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import PublicNavbar from "@/components/layout/PublicNavbar";
import PublicFooter from "@/components/layout/PublicFooter";
import CourseCard from "@/components/courses/CourseCard";
import type { Course } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: `${t("heroTitle")} — Physics Academy` };
}

async function getFeaturedCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*, instructor:profiles(id, full_name, avatar_url)")
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .limit(6);
  return (data as unknown as Course[]) || [];
}

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    titleKey: "feature1Title",
    descKey: "feature1Desc",
    color: "text-brand-600 bg-brand-50",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    titleKey: "feature2Title",
    descKey: "feature2Desc",
    color: "text-accent-600 bg-accent-50",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    titleKey: "feature3Title",
    descKey: "feature3Desc",
    color: "text-purple-600 bg-purple-50",
  },
];

const STATS = [
  { value: "10K+", label: "Students enrolled" },
  { value: "50+",  label: "Video lectures" },
  { value: "98%",  label: "Satisfaction rate" },
  { value: "24/7", label: "Access anywhere" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const courses = await getFeaturedCourses();
  const isRTL = locale === "ar";

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px), linear-gradient(to right, rgb(255 255 255 / 0.07) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -start-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="content-container relative py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
              {isRTL ? "منصة الفيزياء الأولى في المنطقة" : "Egypt's premier physics platform"}
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/75 sm:text-xl">
              {t("heroSubtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/courses" className="btn-white btn-primary-lg w-full sm:w-auto">
                {t("heroButton")}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flip-rtl">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="/login" className="btn-brand-outline w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                {isRTL ? "تسجيل الدخول" : "Sign in"}
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm"
              >
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="section-py bg-white">
        <div className="content-container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              {t("whyUs")}
            </h2>
            <p className="mt-4 text-lg text-surface-500">
              {isRTL
                ? "كل ما تحتاجه لتفوق في الفيزياء في مكان واحد"
                : "Everything you need to excel in physics, in one place"}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-surface-100 bg-white p-8 shadow-card hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-surface-900">
                  {t(f.titleKey as any)}
                </h3>
                <p className="text-sm leading-relaxed text-surface-500">
                  {t(f.descKey as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="section-py bg-surface-50">
        <div className="content-container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              {isRTL ? "كيف يعمل؟" : "How it works"}
            </h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute top-8 start-[16.67%] end-[16.67%] hidden h-px bg-gradient-to-r from-brand-200 via-accent-200 to-brand-200 sm:block" />

            {[
              {
                step: "01",
                title: isRTL ? "اختر كورسك" : "Choose your course",
                desc: isRTL ? "تصفح الكورسات المتاحة وسجّل في ما يناسبك" : "Browse the catalog and enroll in what fits your goals",
              },
              {
                step: "02",
                title: isRTL ? "تعلم بالفيديو" : "Learn with video",
                desc: isRTL ? "شاهد محاضرات عالية الجودة في أي وقت" : "Watch high-quality lectures at your own pace",
              },
              {
                step: "03",
                title: isRTL ? "اختبر نفسك" : "Test yourself",
                desc: isRTL ? "حل الاختبارات واحصل على شهادتك" : "Take timed exams and earn your certificate",
              },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-surface-200 shadow-card text-xl font-bold text-brand-600">
                  {item.step}
                </div>
                <h3 className="font-semibold text-surface-900">{item.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ───────────────────────────────────────────────── */}
      {courses.length > 0 && (
        <section className="section-py bg-white">
          <div className="content-container">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-surface-900">
                  {t("featuredCourses")}
                </h2>
                <p className="mt-2 text-surface-500">
                  {isRTL ? "الكورسات الأكثر مشاهدة" : "Our most popular courses"}
                </p>
              </div>
              <Link
                href="/courses"
                className="flex-shrink-0 text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                {tCommon("viewAll")}
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 flip-rtl">
                  <path fillRule="evenodd" d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="section-py">
        <div className="content-container">
          <div className="relative overflow-hidden rounded-3xl bg-hero-gradient px-8 py-16 text-center sm:px-16">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, rgb(255 255 255 / 0.3) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {isRTL ? "ابدأ رحلتك في الفيزياء اليوم" : "Start your physics journey today"}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
                {isRTL
                  ? "انضم إلى آلاف الطلاب الذين يتعلمون الفيزياء معنا"
                  : "Join thousands of students already mastering physics with us"}
              </p>
              <Link href="/signup" className="btn-white btn-primary-lg mt-8 inline-flex">
                {isRTL ? "أنشئ حسابك مجاناً" : "Create your free account"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}