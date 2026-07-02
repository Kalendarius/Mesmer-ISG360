"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export interface LoginActionResult {
  error?: string;
}

export async function signInAction(input: LoginInput, next?: string): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Geçersiz giriş bilgileri." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  redirect(next && next.startsWith("/") ? next : "/anasayfa");
}
