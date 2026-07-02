"use server";

import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";

export interface ResetPasswordActionResult {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ResetPasswordActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz şifre." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum süresi dolmuş. Lütfen sıfırlama bağlantısını yeniden isteyin." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Şifre güncellenemedi: " + error.message };
  }

  return { success: true };
}
