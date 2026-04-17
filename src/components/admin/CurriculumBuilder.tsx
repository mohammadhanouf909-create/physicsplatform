"use client";

import { useState, useTransition } from "react";
import {
  createSectionAction,
  deleteSectionAction,
  createLectureAction,
  deleteLectureAction,
  uploadMaterialAction,
  deleteMaterialAction,
} from "@/app/[locale]/(admin)/admin/courses/actions";
import type { Course, Section, Lecture, Material } from "@/types/database";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  course: Course;
  locale: string;
}

export default function CurriculumBuilder({ course, locale }: Props) {
  const [sections, setSections] = useState<Section[]>(
    (course.sections as Section[]) || []
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id))
  );
  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleSection(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleLecture(id: string) {
    setExpandedLectures((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Add Section ──────────────────────────────────────────────────────────
  function handleAddSection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const result = await createSectionAction(course.id, locale, fd);
      if (result?.error) {
        setError(result.error);
      } else {
        form.reset();
        // Optimistic: refresh will happen via revalidation but we also do a reload
        window.location.reload();
      }
    });
  }

  // ── Delete Section ───────────────────────────────────────────────────────
  function handleDeleteSection(sectionId: string) {
    if (!confirm("Delete this section and all its lectures?")) return;
    startTransition(async () => {
      await deleteSectionAction(sectionId, course.id, locale);
      window.location.reload();
    });
  }

  // ── Add Lecture ──────────────────────────────────────────────────────────
  function handleAddLecture(
    e: React.FormEvent<HTMLFormElement>,
    sectionId: string
  ) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const result = await createLectureAction(
        sectionId,
        course.id,
        locale,
        fd
      );
      if (result?.error) {
        setError(result.error);
      } else {
        form.reset();
        window.location.reload();
      }
    });
  }

  // ── Delete Lecture ───────────────────────────────────────────────────────
  function handleDeleteLecture(lectureId: string) {
    if (!confirm("Delete this lecture?")) return;
    startTransition(async () => {
      await deleteLectureAction(lectureId, course.id, locale);
      window.location.reload();
    });
  }

  // ── Upload Material ──────────────────────────────────────────────────────
  function handleUploadMaterial(
    e: React.FormEvent<HTMLFormElement>,
    lectureId: string
  ) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    startTransition(async () => {
      const result = await uploadMaterialAction(
        lectureId,
        course.id,
        locale,
        fd
      );
      if (result?.error) {
        setError(result.error);
      } else {
        form.reset();
        window.location.reload();
      }
    });
  }

  // ── Delete Material ──────────────────────────────────────────────────────
  function handleDeleteMaterial(materialId: string, filePath: string) {
    if (!confirm("Delete this file?")) return;
    startTransition(async () => {
      await deleteMaterialAction(materialId, filePath, course.id, locale);
      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Sections list */}
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-gray-200 bg-white overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center justify-between bg-gray-50 px-5 py-3">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center gap-2 text-start flex-1"
            >
              <span className="text-gray-400 text-xs">
                {expandedSections.has(section.id) ? "▼" : "▶"}
              </span>
              <div>
                <span className="font-medium text-gray-900">
                  {section.title}
                </span>
                {section.title_ar && (
                  <span className="ms-2 text-sm text-gray-400" dir="rtl">
                    {section.title_ar}
                  </span>
                )}
              </div>
              <span className="ms-2 badge-gray text-xs">
                {(section as any).lectures?.length ?? 0} lectures
              </span>
            </button>
            <button
              onClick={() => handleDeleteSection(section.id)}
              disabled={isPending}
              className="ms-2 text-xs text-red-500 hover:text-red-700 px-2 py-1"
            >
              Delete
            </button>
          </div>

          {/* Section content */}
          {expandedSections.has(section.id) && (
            <div className="px-5 py-4 space-y-3">
              {/* Lectures */}
              {((section as any).lectures || []).map((lecture: Lecture) => (
                <div
                  key={lecture.id}
                  className="rounded-lg border border-gray-100 bg-gray-50"
                >
                  {/* Lecture row */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => toggleLecture(lecture.id)}
                      className="flex items-center gap-2 text-start flex-1"
                    >
                      <span className="text-gray-400 text-xs">
                        {expandedLectures.has(lecture.id) ? "▼" : "▶"}
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        {lecture.title}
                      </span>
                      {lecture.is_preview && (
                        <span className="badge-blue text-xs">Preview</span>
                      )}
                      {lecture.video_bunny_id && (
                        <span className="badge-green text-xs">Video</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {(lecture as any).materials?.length ?? 0} files
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteLecture(lecture.id)}
                      disabled={isPending}
                      className="ms-2 text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Materials */}
                  {expandedLectures.has(lecture.id) && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                      {/* Existing materials */}
                      {((lecture as any).materials || []).length > 0 && (
                        <div className="space-y-1.5">
                          {((lecture as any).materials as Material[]).map(
                            (m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border border-gray-100"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">📄</span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {m.title}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {m.file_name} ·{" "}
                                      {(m.file_size / 1024).toFixed(0)} KB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteMaterial(m.id, m.file_url)
                                  }
                                  disabled={isPending}
                                  className="text-xs text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Upload material form */}
                      <form
                        onSubmit={(e) => handleUploadMaterial(e, lecture.id)}
                        className="flex flex-wrap items-end gap-3 pt-2 border-t border-gray-100"
                      >
                        <div className="flex-1 min-w-40">
                          <label className="form-label text-xs">
                            File title
                          </label>
                          <input
                            name="title"
                            type="text"
                            className="form-input py-1.5 text-xs"
                            placeholder="e.g. Chapter 3 Notes"
                          />
                        </div>
                        <div className="flex-1 min-w-40">
                          <label className="form-label text-xs">
                            عنوان الملف (عربي)
                          </label>
                          <input
                            name="title_ar"
                            type="text"
                            dir="rtl"
                            className="form-input py-1.5 text-xs"
                          />
                        </div>
                        <div className="flex-1 min-w-48">
                          <label className="form-label text-xs">
                            PDF file (max 50 MB)
                          </label>
                          <input
                            name="file"
                            type="file"
                            required
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            className="text-xs text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:text-blue-700"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          {isPending ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            "Upload"
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}

              {/* Add lecture form */}
              <form
                onSubmit={(e) => handleAddLecture(e, section.id)}
                className="rounded-lg border border-dashed border-gray-200 p-4 space-y-3"
              >
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Add Lecture
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="form-label text-xs">
                      Title (EN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      type="text"
                      required
                      className="form-input py-1.5 text-sm"
                      placeholder="Lecture title"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">العنوان (عربي)</label>
                    <input
                      name="title_ar"
                      type="text"
                      dir="rtl"
                      className="form-input py-1.5 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_preview"
                      value="true"
                      className="accent-blue-600"
                    />
                    <span className="text-xs text-gray-600">
                      Free preview (visible without enrollment)
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary py-1.5 px-4 text-xs"
                  >
                    {isPending ? <LoadingSpinner size="sm" className="text-white" /> : "Add Lecture"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ))}

      {/* Add section form */}
      <form
        onSubmit={handleAddSection}
        className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-5"
      >
        <p className="mb-3 text-sm font-medium text-blue-700">
          + Add New Section
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="form-label text-xs">
              Section Title (EN) <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              className="form-input py-2 text-sm"
              placeholder="e.g. Introduction to Mechanics"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="form-label text-xs">
              عنوان القسم (عربي)
            </label>
            <input
              name="title_ar"
              type="text"
              dir="rtl"
              className="form-input py-2 text-sm"
              placeholder="مقدمة في الميكانيكا"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary py-2 px-5 text-sm"
          >
            {isPending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              "Add Section"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}