"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { deleteCourseAction } from "@/app/[locale]/(admin)/admin/courses/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  courseId: string;
  courseTitle: string;
}

export default function DeleteCourseButton({ courseId, courseTitle }: Props) {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${courseTitle}"? This will permanently remove all sections, lectures, and materials.`
      )
    )
      return;

    startTransition(async () => {
      await deleteCourseAction(courseId, locale);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="btn-danger py-1.5 px-3 text-xs"
    >
      {isPending ? <LoadingSpinner size="sm" className="text-white" /> : "Delete"}
    </button>
  );
}