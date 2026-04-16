"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
});

export type AuthState = { error?: string; success?: string };

// 1. أكشن تسجيل الدخول
export async function loginAction(locale: string, _prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = { email: formData.get("email") as string, password: formData.get("password") as string };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid format" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid credentials" };

  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

// 2. أكشن إنشاء حساب (النسخة النهائية والجذرية)
export async function signupAction(locale: string, _prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    full_name: formData.get("full_name") as string,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { error: "Check details and try again" };

  const supabase = await createClient();
  
  // أ. إنشاء الحساب في Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signUpError) return { error: signUpError.message };
  if (!data.user) return { error: "Signup failed" };

  // ب. إنشاء البروفايل أو تحديثه (الضمان ضد التكرار)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ 
        id: data.user.id, 
        full_name: parsed.data.full_name, 
        email: parsed.data.email,
        role: "student" 
    }, { onConflict: 'id' });

  if (profileError) return { error: "Profile error: " + profileError.message };

  // ج. تثبيت الجلسة (الحل الجذري لمشكلة الـ Redirect)
  await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  // د. تحديث المسارات والتحويل للوحة التحكم
  revalidatePath("/", "layout");
  redirect(`/${locale}/dashboard`);
}

// 3. أكشن الخروج
export async function logoutAction(locale: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}/login`);
}

// 4. أكشن استعادة كلمة المرور
export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`,
  });
  if (error) return { error: error.message };
  return { success: "Check your email" };
}