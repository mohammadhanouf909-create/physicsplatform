"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isFree: boolean;
  price: number;
  currency: string;
  locale: string;
  userId?: string;
}

export default function EnrollButton({
  courseId,
  isEnrolled,
  isFree,
  price,
  currency,
  locale,
  userId,
}: EnrollButtonProps) {
  const t = useTranslations("common");
  const tCourses = useTranslations("courses");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isEnrolled) {
    return (
      <Link
        href={`/courses/${courseId}/learn`}
        className="btn-primary w-full mt-4 justify-center"
      >
        {t("continue")} →
      </Link>
    );
  }

  if (!userId) {
    return (
      <Link
        href="/login"
        className="btn-primary w-full mt-4 justify-center"
      >
        {t("enroll")}
      </Link>
    );
  }

  async function handleEnroll() {
    setLoading(true);
    setError(null);

    // Free course: enroll directly
    if (isFree) {
      const supabase = createClient();
      const { error: enrollError } = await supabase
        .from("enrollments")
        .insert({
          student_id: userId,
          course_id: courseId,
          status: "active",
        });

      if (enrollError) {
        if (enrollError.code === "23505") {
          router.push(`/${locale}/courses/${courseId}/learn`);
          return;
        }
        setError(enrollError.message);
        setLoading(false);
        return;
      }

      router.push(`/${locale}/courses/${courseId}/learn`);
      return;
    }

    // Paid course: go to Stripe (implemented Day 6)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {error && (
        <p className="mb-2 text-xs text-red-600">{error}</p>
      )}
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="btn-primary w-full justify-center"
      >
        {loading ? (
          <LoadingSpinner size="sm" className="text-white" />
        ) : (
          t("enroll")
        )}
      </button>
    </div>
  );
}