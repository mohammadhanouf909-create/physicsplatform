"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ─── 1. Helpers & Auth ────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized: Please log in again");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!["admin", "instructor", "assistant"].includes(profile?.role ?? "")) {
    throw new Error("Forbidden: You don't have admin privileges");
  }
  return { supabase, user, role: profile!.role };
}

// ─── 2. Schemas ───────────────────────────────────────────────────────────────

const courseSchema = z.object({
  title: z.string().min(2, "العنوان قصير جداً"),
  title_ar: z.string().optional(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  price: z.coerce.number().min(0),
  currency: z.string().default("USD"),
  is_free: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  instructor_id: z.string().uuid().optional(),
});

export type ActionState = { error?: string; success?: string };

// ─── 3. Course Management Actions ─────────────────────────────────────────────

export async function createCourseAction(
  locale: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  let newCourseId = null;

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
      return { error: "الرجاء التأكد من صحة البيانات المدخلة." };
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

    if (error) return { error: `خطأ في قاعدة البيانات: ${error.message}` };
    if (!course) return { error: "لم يتم إنشاء الكورس." };

    // رفع صورة الغلاف (Thumbnail)
    const thumbnail = formData.get("thumbnail") as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split(".").pop();
      const path = `courses/${course.id}/thumbnail.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(path, thumbnail, { upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(path);
        await supabase.from("courses").update({ thumbnail_url: publicUrl }).eq("id", course.id);
      }
    }

    newCourseId = course.id;
  } catch (err: any) {
    return { error: `خطأ في النظام: ${err.message}` };
  }

  // التوجيه الناجح (يجب أن يكون خارج الـ try/catch)
  if (newCourseId) {
    revalidatePath(`/${locale}/admin/courses`);
    redirect(`/${locale}/admin/courses/${newCourseId}`);
  }

  return { error: "فشل الإرسال غير معروف" };
}

export async function updateCourseAction(
  locale: string,
  courseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
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
    if (!parsed.success) return { error: "الرجاء إكمال الحقول المطلوبة بشكل صحيح." };

    const payload = {
      ...parsed.data,
      price: parsed.data.is_free ? 0 : parsed.data.price,
    };

    const { error } = await supabase.from("courses").update(payload).eq("id", courseId);
    if (error) return { error: error.message };

    // تحديث صورة الغلاف
    const thumbnail = formData.get("thumbnail") as File | null;
    if (thumbnail && thumbnail.size > 0) {
      const ext = thumbnail.name.split(".").pop();
      const path = `courses/${courseId}/thumbnail.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(path, thumbnail, { upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("thumbnails").getPublicUrl(path);
        await supabase.from("courses").update({ thumbnail_url: publicUrl }).eq("id", courseId);
      }
    }

    revalidatePath(`/${locale}/admin/courses`);
    revalidatePath(`/${locale}/admin/courses/${courseId}`);
    return { success: "تم تحديث الكورس بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "فشل التحديث" };
  }
}

export async function deleteCourseAction(
  courseId: string, 
  locale: string
): Promise<ActionState | void> {
  let isDeleted = false;
  try {
    const { supabase } = await requireAdmin();
    
    // سيقوم Supabase بحذف الأقسام والدروس المرتبطة تلقائياً إذا كان مفعل Cascade Delete
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) return { error: error.message };
    
    isDeleted = true;
  } catch (err: any) {
    return { error: err.message };
  }

  if (isDeleted) {
    revalidatePath(`/${locale}/admin/courses`);
    redirect(`/${locale}/admin/courses`);
  }
}

// ─── 4. Curriculum Actions (Sections & Lectures) ──────────────────────────────

export async function createSectionAction(courseId: string, formData: FormData) {
  try {
    const { supabase } = await requireAdmin();
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;

    const { error } = await supabase.from("sections").insert({
      course_id: courseId,
      title,
      title_ar,
      order_index: 0 // يمكن تطويرها لاحقاً لترتيب الأقسام
    });

    if (error) throw new Error(error.message);
    revalidatePath(`/[locale]/admin/courses/[courseId]`, "page");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteSectionAction(sectionId: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("sections").delete().eq("id", sectionId);
    if (error) throw new Error(error.message);
    revalidatePath(`/[locale]/admin/courses/[courseId]`, "page");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createLectureAction(sectionId: string, formData: FormData) {
  try {
    const { supabase } = await requireAdmin();
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const is_free_preview = formData.get("is_free_preview") === "true";

    const { error } = await supabase.from("lectures").insert({
      section_id: sectionId,
      title,
      title_ar,
      is_free_preview,
    });

    if (error) throw new Error(error.message);
    revalidatePath(`/[locale]/admin/courses/[courseId]`, "page");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteLectureAction(lectureId: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("lectures").delete().eq("id", lectureId);
    if (error) throw new Error(error.message);
    revalidatePath(`/[locale]/admin/courses/[courseId]`, "page");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}