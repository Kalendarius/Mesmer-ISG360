"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { maddeSchema, toMaddeRecord, type MaddeInput } from "@/lib/validation/regulation";

export interface ActionResult {
  error?: string;
}

/**
 * Bir madde her düzenlendiğinde eski satır is_current=false'a çekilir ve
 * aynı madde_no ile yeni version_no'lu bir satır eklenir — mevcut sürüm
 * hiçbir zaman yerinde değiştirilmez (versiyon geçmişi korunur).
 */
export async function upsertMaddeAction(regulationId: string, input: MaddeInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = maddeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("regulation_versions")
    .select("id, version_no")
    .eq("regulation_id", regulationId)
    .eq("madde_no", parsed.data.madde_no)
    .eq("is_current", true)
    .maybeSingle();

  if (existing) {
    const { error: updateError } = await supabase
      .from("regulation_versions")
      .update({ is_current: false })
      .eq("id", existing.id);
    if (updateError) return { error: "Önceki versiyon güncellenemedi: " + updateError.message };
  }

  const { error } = await supabase.from("regulation_versions").insert({
    ...toMaddeRecord(parsed.data),
    regulation_id: regulationId,
    organization_id: context.activeOrganization.organizationId,
    version_no: (existing?.version_no ?? 0) + 1,
    is_current: true,
    created_by: context.userId,
  });

  if (error) return { error: "Madde kaydedilemedi: " + error.message };

  revalidatePath(`/mevzuat/${regulationId}`);
  return {};
}
