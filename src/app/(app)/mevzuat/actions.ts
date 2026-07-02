"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { regulationSchema, toRegulationRecord, type RegulationInput } from "@/lib/validation/regulation";

export interface ActionResult {
  error?: string;
}

export async function createRegulationAction(input: RegulationInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = regulationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regulations")
    .insert({ ...toRegulationRecord(parsed.data), organization_id: context.activeOrganization.organizationId })
    .select("id")
    .single();

  if (error) return { error: "Mevzuat oluşturulamadı: " + error.message };

  revalidatePath("/mevzuat");
  redirect(`/mevzuat/${data.id}`);
}

export async function updateRegulationAction(regulationId: string, input: RegulationInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = regulationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("regulations").update(toRegulationRecord(parsed.data)).eq("id", regulationId);

  if (error) return { error: "Mevzuat güncellenemedi: " + error.message };

  revalidatePath("/mevzuat");
  revalidatePath(`/mevzuat/${regulationId}`);
  redirect(`/mevzuat/${regulationId}`);
}

export async function setRegulationActiveAction(regulationId: string, isActive: boolean): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("regulations").update({ is_active: isActive }).eq("id", regulationId);

  if (error) return { error: "Durum güncellenemedi: " + error.message };

  revalidatePath("/mevzuat");
  revalidatePath(`/mevzuat/${regulationId}`);
  return {};
}
