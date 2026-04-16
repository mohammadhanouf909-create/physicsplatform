"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// 1. التعريفات الأساسية
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
});

export type AuthState = {
  error?: string;
  success?: string;
};

// 2. أكشن تسجيل الدخول
export async function loginAction(
  locale: string,
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid email or password format" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { error: "Invalid email or password" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Login failed" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";

  if (role === "admin" || role === "instructor" || role === "assistant") {
    redirect(`/${locale}/admin`);
  } else {
    redirect(`/${locale}/dashboard`);
  }
}

// 3. أكشن إنشاء حساب (تعديل ذكي لحل مشكلة التكرار)
export async function signupAction(
  locale: string,
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    full_name: formData.get("full_name") as string,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { error: "Check details and try again" };

  const supabase = await createClient();
  
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signUpError) return { error: signUpError.message };
  if (!data.user) return { error: "Signup failed" };

  // التعديل هنا: استخدام .upsert بدلاً من .insert
  // الـ upsert معناها: "لو موجود حدثه، ولو مش موجود ضيفه" - وبكدة مش هيطلع Error أبداً
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ 
        id: data.user.id, 
        full_name: parsed.data.full_name, 
        email: parsed.data.email,
        role: "student" 
    }, { onConflict: 'id' }); // حل مشكلة التكرار

  if (profileError) return { error: "Profile error: " + profileError.message };

  redirect(`/${locale}/dashboard`);
}

// 4. أكشن الخروج
export async function logoutAction(locale: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

// 5. أكشن استعادة كلمة المرور
export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`,
  });

  if (error) return { error: error.message };
  return { success: "Check your email" };
}