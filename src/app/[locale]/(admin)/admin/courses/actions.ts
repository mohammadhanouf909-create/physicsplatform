"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["admin", "instructor", "assistant"].includes(profile?.role ?? "")) {
    throw new Error("Forbidden");
  }
  return { supabase, user, role: profile!.role };
}

// ─── Course ───────────────────────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(2),
  title_ar: z.string().optional(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  is_free: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  instructor_id: z.string().uuid().optional(),
});

export type CourseFormState = { error?: string; success?: string };

export async function createCourseAction(
  locale: string,
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const { supabase, user } = await requireAdmin();

    const raw = {
      title: formData.get("title"),
      title_ar: formData.get("title_ar") || undefined,
      description: formData.get("description") || undefined,
      description_ar: formData.get("description_ar") || undefined,
      price: formData.get("price") || "0",
      currency: formData.get("currency") || "USD",
      is_free: formData.get("is_free") === "true",
      status: formData.get("status") || "draft",
      instructor_id: formData.get("instructor_id") || undefined,
    };

    const parsed = courseSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Please fill in all required fields correctly" };
    }

    const payload = {
      ...parsed.data,
      instructor_id: parsed.data.instructor_id ?? user.id,
      price: parsed.data.is_free ? 0 : parsed.data.price,
    };

    const { data: course, error } = await supabase
      .from("courses")
      .insert(payload)
      .select()
      .single();

    if (error) return { error: error.message };

    // Handle thumbnail upload if provided
    const thumbnail = formData.get("thumbnail") as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split(".").pop();
      const path = `courses/${course.id}/thumbnail.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(path, thumbnail, { upsert: true });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("thumbnails").getPublicUrl(path);
        await supabase
          .from("courses")
          .update({ thumbnail_url: publicUrl })
          .eq("id", course.id);
      }
    }

    revalidatePath(`/${locale}/admin/courses`);
    redirect(`/${locale}/admin/courses/${course.id}`);
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message || "Failed to create course" };
  }
}

export async function updateCourseAction(
  locale: string,
  courseId: string,
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  try {
    const { supabase } = await requireAdmin();

    const raw = {
      title: formData.get("title"),
      title_ar: formData.get("title_ar") || undefined,
      description: formData.get("description") || undefined,
      description_ar: formData.get("description_ar") || undefined,
      price: formData.get("price") || "0",
      currency: formData.get("currency") || "USD",
      is_free: formData.get("is_free") === "true",
      status: formData.get("status") || "draft",
      instructor_id: formData.get("instructor_id") || undefined,
    };

    const parsed = courseSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Please fill in all required fields correctly" };
    }

    const payload = {
      ...parsed.data,
      price: parsed.data.is_free ? 0 : parsed.data.price,
    };

    const { error } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", courseId);

    if (error) return { error: error.message };

    // Handle thumbnail upload
    const thumbnail = formData.get("thumbnail") as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split(".").pop();
      const path = `courses/${courseId}/thumbnail.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(path, thumbnail, { upsert: true });

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("thumbnails").getPublicUrl(path);
        await supabase
          .from("courses")
          .update({ thumbnail_url: publicUrl })
          .eq("id", courseId);
      }
    }

    revalidatePath(`/${locale}/admin/courses`);
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: "Course updated successfully" };
  } catch (err: any) {
    return { error: err.message || "Failed to update course" };
  }
}

export async function deleteCourseAction(courseId: string, locale: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);
    if (error) throw error;
    revalidatePath(`/${locale}/admin/courses`);
    redirect(`/${locale}/admin/courses`);
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return { error: err.message };
  }
}

export async function toggleCourseStatusAction(
  courseId: string,
  currentStatus: string,
  locale: string
) {
  try {
    const { supabase } = await requireAdmin();
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", courseId);
    if (error) throw error;
    revalidatePath(`/${locale}/admin/courses`);
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── Sections ────────────────────────────────────────────────────────────────

export async function createSectionAction(
  courseId: string,
  locale: string,
  formData: FormData
) {
  try {
    const { supabase } = await requireAdmin();
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string | null;

    if (!title) return { error: "Title is required" };

    // Get max sort_order
    const { data: existing } = await supabase
      .from("sections")
      .select("sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const sort_order = ((existing?.[0]?.sort_order ?? -1) + 1);

    const { error } = await supabase.from("sections").insert({
      course_id: courseId,
      title,
      title_ar: title_ar || null,
      sort_order,
    });

    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateSectionAction(
  sectionId: string,
  courseId: string,
  locale: string,
  formData: FormData
) {
  try {
    const { supabase } = await requireAdmin();
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string | null;

    const { error } = await supabase
      .from("sections")
      .update({ title, title_ar: title_ar || null })
      .eq("id", sectionId);

    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteSectionAction(
  sectionId: string,
  courseId: string,
  locale: string
) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("sections")
      .delete()
      .eq("id", sectionId);
    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── Lectures ────────────────────────────────────────────────────────────────

export async function createLectureAction(
  sectionId: string,
  courseId: string,
  locale: string,
  formData: FormData
) {
  try {
    const { supabase } = await requireAdmin();

    const { data: existing } = await supabase
      .from("lectures")
      .select("sort_order")
      .eq("section_id", sectionId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const sort_order = ((existing?.[0]?.sort_order ?? -1) + 1);

    const { error } = await supabase.from("lectures").insert({
      section_id: sectionId,
      course_id: courseId,
      title: formData.get("title") as string,
      title_ar: (formData.get("title_ar") as string) || null,
      description: (formData.get("description") as string) || null,
      is_preview: formData.get("is_preview") === "true",
      sort_order,
    });

    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateLectureAction(
  lectureId: string,
  courseId: string,
  locale: string,
  formData: FormData
) {
  try {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("lectures")
      .update({
        title: formData.get("title") as string,
        title_ar: (formData.get("title_ar") as string) || null,
        description: (formData.get("description") as string) || null,
        is_preview: formData.get("is_preview") === "true",
      })
      .eq("id", lectureId);

    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteLectureAction(
  lectureId: string,
  courseId: string,
  locale: string
) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("lectures")
      .delete()
      .eq("id", lectureId);
    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ─── Materials ───────────────────────────────────────────────────────────────

export async function uploadMaterialAction(
  lectureId: string,
  courseId: string,
  locale: string,
  formData: FormData
) {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const title_ar = (formData.get("title_ar") as string) || null;

    if (!file || file.size === 0) return { error: "No file selected" };
    if (file.size > 50 * 1024 * 1024) return { error: "File must be under 50MB" };

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${courseId}/${lectureId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(path, file);

    if (uploadError) return { error: uploadError.message };

    const { data: existing } = await supabase
      .from("materials")
      .select("sort_order")
      .eq("lecture_id", lectureId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const sort_order = ((existing?.[0]?.sort_order ?? -1) + 1);

    const { error: dbError } = await supabase.from("materials").insert({
      lecture_id: lectureId,
      course_id: courseId,
      title: title || file.name,
      title_ar,
      file_url: path,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      sort_order,
    });

    if (dbError) return { error: dbError.message };

    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteMaterialAction(
  materialId: string,
  filePath: string,
  courseId: string,
  locale: string
) {
  try {
    const { supabase } = await requireAdmin();

    await supabase.storage.from("materials").remove([filePath]);
    const { error } = await supabase
      .from("materials")
      .delete()
      .eq("id", materialId);

    if (error) return { error: error.message };
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}