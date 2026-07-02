"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { MESMER_ORGANIZATION_ID } from "@/lib/constants";
import { templateSchema, toTemplateRecord, type TemplateInput } from "@/lib/validation/checklist";

export interface ActionResult {
  error?: string;
}

export async function createTemplateAction(input: TemplateInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }
  if (context.activeOrganization.organizationId !== MESMER_ORGANIZATION_ID) {
    return { error: "Yeni kontrol listesi şablonu yalnızca MESMER tarafından oluşturulabilir." };
  }

  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("checklist_templates")
    .insert({
      ...toTemplateRecord(parsed.data),
      organization_id: context.activeOrganization.organizationId,
      created_by: context.userId,
      updated_by: context.userId,
    })
    .select("id")
    .single();

  if (error) return { error: "Şablon oluşturulamadı: " + error.message };

  const { error: versionError } = await supabase.from("checklist_template_versions").insert({
    checklist_template_id: template.id,
    organization_id: context.activeOrganization.organizationId,
    version_no: 1,
    is_current: true,
    notes: "İlk sürüm.",
    created_by: context.userId,
  });

  if (versionError) return { error: "Şablon versiyonu oluşturulamadı: " + versionError.message };

  revalidatePath("/kontrol-listeleri");
  redirect(`/kontrol-listeleri/${template.id}`);
}

export async function updateTemplateAction(templateId: string, input: TemplateInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_templates")
    .update({ ...toTemplateRecord(parsed.data), updated_by: context.userId })
    .eq("id", templateId);

  if (error) return { error: "Şablon güncellenemedi: " + error.message };

  revalidatePath("/kontrol-listeleri");
  revalidatePath(`/kontrol-listeleri/${templateId}`);
  redirect(`/kontrol-listeleri/${templateId}`);
}

export async function setTemplateActiveAction(templateId: string, isActive: boolean): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_templates")
    .update({ is_active: isActive, updated_by: context.userId })
    .eq("id", templateId);

  if (error) return { error: "Durum güncellenemedi: " + error.message };

  revalidatePath("/kontrol-listeleri");
  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}
