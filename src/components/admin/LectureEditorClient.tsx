"use client";

import { useState, useTransition } from "react";
import VideoUploader from "./VideoUploader";
import { updateLectureAction } from "@/app/[locale]/(admin)/admin/courses/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getBunnyEmbedUrl } from "@/lib/bunny";

interface Props {
  lecture: any;
  courseId: string;
  locale: string;
}

export default function LectureEditorClient({ lecture, courseId, locale }: Props) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [videoReady, setVideoReady] = useState(!!lecture.video_bunny_id);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await updateLectureAction(lecture.id, courseId, locale, fd);
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  function handleVideoReady(videoId: string, duration: number) {
    setVideoReady(true);
  }

  return (
    <div className="space-y-6">
      {/* Lecture details */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Lecture Details
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            Saved successfully
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">
                Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                defaultValue={lecture.title}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">العنوان (عربي)</label>
              <input
                name="title_ar"
                type="text"
                defaultValue={lecture.title_ar ?? ""}
                dir="rtl"
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description (optional)</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={lecture.description ?? ""}
              className="form-input resize-none"
              placeholder="Brief description of what this lecture covers"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_preview"
                value="true"
                defaultChecked={lecture.is_preview}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                Free preview — visible to non-enrolled students
              </span>
            </label>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? (
                <LoadingSpinner size="sm" className="text-white" />
              ) : (
                "Save Details"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Video section */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Video
        </h2>

        {lecture.video_bunny_id && videoReady ? (
          <div className="space-y-4">
            {/* Preview player */}
            <div className="video-container">
              <iframe
                src={getBunnyEmbedUrl(lecture.video_bunny_id)}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              />
            </div>
            <p className="text-xs text-gray-400">
              Video ID: {lecture.video_bunny_id}
            </p>
            <p className="text-xs text-gray-500">
              To replace this video, go back to the course editor and delete then re-add the lecture.
            </p>
          </div>
        ) : (
          <VideoUploader
            lectureId={lecture.id}
            courseId={courseId}
            lectureTitle={lecture.title}
            existingVideoId={lecture.video_bunny_id}
            onUploadComplete={handleVideoReady}
          />
        )}
      </div>
    </div>
  );
}