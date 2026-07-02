"use server";

import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/auth";

export interface ForgotPasswordActionResult {
  error?: string;
  success?: boolean;
}

export async function requestPasswordResetAction(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/sifre-sifirla`,
  });

  // Kullanıcı numaralandırma saldırılarını önlemek için e-postanın sistemde
  // kayıtlı olup olmadığından bağımsız olarak her zaman başarı döndürülür.
  return { success: true };
}
