"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cloneStarterContent } from "@/lib/onboarding/clone-starter-content";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";

export interface SignUpActionResult {
  error?: string;
}

/**
 * Herkese açık kayıt: her yeni kullanıcı kendi izole kuruluşunu oluşturur
 * ve o kuruluşun `organization_admin`i olur (bkz. CLAUDE.md → Herkese açık
 * kayıt ve self-service kuruluş oluşturma). Kuruluş oluşturma ve başlangıç
 * içeriği kopyalama, normal RLS'in bunu engellemesi nedeniyle (yeni
 * kullanıcı henüz hiçbir kuruluşun üyesi değil — "civciv-yumurta" durumu)
 * yalnızca bu server action içinde, service-role client ile yapılır.
 */
export async function signUpAction(input: SignUpInput): Promise<SignUpActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const { fullName, companyName, email, password } = parsed.data;

  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes("already registered")) {
      return { error: "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin." };
    }
    return { error: "Kayıt oluşturulamadı: " + signUpError.message };
  }
  if (!signUpData.user) return { error: "Kayıt oluşturulamadı." };

  const admin = createAdminClient();
  const userId = signUpData.user.id;

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({ legal_name: companyName, display_name: companyName })
    .select("id")
    .single();

  if (orgError || !organization) {
    return { error: "Kuruluş oluşturulamadı: " + (orgError?.message ?? "bilinmeyen hata") };
  }

  const { error: memberError } = await admin.from("organization_members").insert({
    organization_id: organization.id,
    user_id: userId,
    role: "organization_admin",
    is_active: true,
  });
  if (memberError) return { error: "Kuruluş üyeliği oluşturulamadı: " + memberError.message };

  await admin.from("profiles").update({ default_organization_id: organization.id }).eq("id", userId);

  await cloneStarterContent(admin, organization.id, userId);

  if (!signUpData.session) {
    // enable_confirmations açıksa oturum hemen kurulmaz; kullanıcı önce
    // e-postasını doğrulamalı.
    redirect("/giris?mesaj=kayit-basarili-eposta-dogrulayin");
  }

  redirect("/anasayfa");
}
