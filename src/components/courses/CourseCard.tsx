import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/types/database";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const locale = useLocale();
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");

  const title = locale === "ar" && course.title_ar ? course.title_ar : course.title;
  const description = locale === "ar" && course.description_ar
    ? course.description_ar
    : course.description;
  const instructorName = (course.instructor as any)?.full_name ?? "";

  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <div className="course-card h-full">
        {/* Thumbnail */}
        <div className="course-card-thumbnail">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-5xl opacity-30">⚛</span>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 start-3 flex gap-1.5">
            {course.is_free && (
              <span className="badge-green text-xs font-semibold shadow-sm">
                {tCommon("free")}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="course-card-body">
          {/* Instructor */}
          {instructorName && (
            <p className="text-xs font-medium text-brand-600">{instructorName}</p>
          )}

          {/* Title */}
          <h3 className="course-card-title">{title}</h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          {/* Footer */}
          <div className="course-card-price">
            <span className="text-lg font-bold text-surface-900">
              {course.is_free
                ? tCommon("free")
                : formatPrice(course.price, course.currency)}
            </span>
            <span className="badge-blue text-xs group-hover:bg-brand-100 transition-colors">
              {t("enrolled")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}