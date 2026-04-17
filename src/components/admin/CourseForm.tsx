"use client";

import { useActionState, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  createCourseAction,
  updateCourseAction,
  toggleCourseStatusAction,
  type CourseFormState,
} from "@/app/[locale]/(admin)/admin/courses/actions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Course, Profile } from "@/types/database";

interface CourseFormProps {
  locale: string;
  course?: Course;
  instructors: Profile[];
}

const initialState: CourseFormState = {};

export default function CourseForm({
  locale,
  course,
  instructors,
}: CourseFormProps) {
  const [isFree, setIsFree] = useState(course?.is_free ?? false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    course?.thumbnail_url ?? null
  );

  const action = course
    ? updateCourseAction.bind(null, locale, course.id)
    : createCourseAction.bind(null, locale);

  const [state, formAction, isPending] = useActionState(action, initialState);

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="card">
      {state.error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.success}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Titles */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">
              Course Title (English) <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={course?.title}
              className="form-input"
              placeholder="e.g. Mechanics & Motion"
            />
          </div>
          <div>
            <label className="form-label">عنوان الكورس (عربي)</label>
            <input
              name="title_ar"
              type="text"
              defaultValue={course?.title_ar ?? ""}
              className="form-input"
              dir="rtl"
              placeholder="مثال: الميكانيكا والحركة"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">Description (English)</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={course?.description ?? ""}
              className="form-input resize-none"
              placeholder="What will students learn?"
            />
          </div>
          <div>
            <label className="form-label">الوصف (عربي)</label>
            <textarea
              name="description_ar"
              rows={3}
              defaultValue={course?.description_ar ?? ""}
              className="form-input resize-none"
              dir="rtl"
              placeholder="ماذا سيتعلم الطلاب؟"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="form-label">Pricing</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_free"
                  value="false"
                  checked={!isFree}
                  onChange={() => setIsFree(false)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">Paid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_free"
                  value="true"
                  checked={isFree}
                  onChange={() => setIsFree(true)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">Free</span>
              </label>
            </div>
          </div>

          {!isFree && (
            <>
              <div>
                <label className="form-label">Price</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={course?.price ?? 0}
                  className="form-input"
                  placeholder="49.99"
                />
              </div>
              <div>
                <label className="form-label">Currency</label>
                <select
                  name="currency"
                  defaultValue={course?.currency ?? "USD"}
                  className="form-input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EGP">EGP (ج.م)</option>
                  <option value="SAR">SAR (ر.س)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Instructor + Status */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="form-label">Instructor</label>
            <select
              name="instructor_id"
              defaultValue={
                (course?.instructor as any)?.id ?? ""
              }
              className="form-input"
            >
              <option value="">Select instructor</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.full_name} ({i.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              defaultValue={course?.status ?? "draft"}
              className="form-input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="form-label">Course Thumbnail</label>
          <div className="flex items-start gap-4">
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-24 w-36 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <input
                name="thumbnail"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailChange}
                className="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                JPG, PNG or WebP. Recommended: 1280×720
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary min-w-28"
          >
            {isPending ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : course ? (
              "Save Changes"
            ) : (
              "Create Course"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}