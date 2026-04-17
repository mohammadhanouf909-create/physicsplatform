"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  lectureId: string;
  courseId: string;
  userId: string;
  isCompleted?: boolean;
}

export default function VideoProgressTracker({
  lectureId,
  courseId,
  userId,
  isCompleted: initialCompleted = false,
}: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggleComplete() {
    setLoading(true);
    const supabase = createClient();
    const newValue = !completed;

    const { error } = await supabase.from("lecture_progress").upsert(
      {
        student_id: userId,
        lecture_id: lectureId,
        course_id: courseId,
        completed: newValue,
        completed_at: newValue ? new Date().toISOString() : null,
      },
      { onConflict: "student_id,lecture_id" }
    );

    if (!error) {
      setCompleted(newValue);
      // Update course progress percent
      await updateCourseProgress(supabase, userId, courseId);
    }
    setLoading(false);
  }

  async function updateCourseProgress(supabase: any, userId: string, courseId: string) {
    // Count total lectures and completed ones
    const { data: allLectures } = await supabase
      .from("lectures")
      .select("id")
      .eq("course_id", courseId);

    const { data: completedLectures } = await supabase
      .from("lecture_progress")
      .select("id")
      .eq("student_id", userId)
      .eq("course_id", courseId)
      .eq("completed", true);

    const total = allLectures?.length || 0;
    const done = completedLectures?.length || 0;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    await supabase
      .from("enrollments")
      .update({
        progress_percent: percent,
        completed_at: percent === 100 ? new Date().toISOString() : null,
        status: percent === 100 ? "completed" : "active",
      })
      .eq("student_id", userId)
      .eq("course_id", courseId);
  }

  return (
    <button
      onClick={toggleComplete}
      disabled={loading}
      className={`
        flex-shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition
        ${completed
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }
      `}
    >
      <span>{completed ? "✓" : "○"}</span>
      {completed ? "Completed" : "Mark complete"}
    </button>
  );
}