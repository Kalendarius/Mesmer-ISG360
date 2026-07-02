"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";

export interface UpdateProfileActionResult {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(input: ProfileInput): Promise<UpdateProfileActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum bulunamadı." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Profil güncellenemedi: " + error.message };
  }

  revalidatePath("/profil");
  revalidatePath("/anasayfa");
  return { success: true };
}
