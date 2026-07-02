"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { inspectionCreateSchema, type InspectionCreateInput } from "@/lib/validation/inspection";

export interface ActionResult {
  error?: string;
}

export async function createInspectionAction(input: InspectionCreateInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = inspectionCreateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const organizationId = context.activeOrganization.organizationId;

  const { data: version, error: versionError } = await supabase
    .from("checklist_template_versions")
    .select("id")
    .eq("checklist_template_id", parsed.data.checklist_template_id)
    .eq("is_current", true)
    .single();

  if (versionError || !version) return { error: "Kontrol listesi versiyonu bulunamadı." };

  const { data: items, error: itemsError } = await supabase
    .from("checklist_items")
    .select("*, regulation_versions(madde_no, madde_metni, regulations(mevzuat_adi))")
    .eq("checklist_template_version_id", version.id)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sira_no");

  if (itemsError) return { error: "Kontrol maddeleri okunamadı: " + itemsError.message };
  if (!items || items.length === 0) return { error: "Seçilen kontrol listesinde aktif madde yok." };

  const { data: inspection, error: inspectionError } = await supabase
    .from("inspections")
    .insert({
      organization_id: organizationId,
      company_id: parsed.data.company_id,
      branch_id: parsed.data.branch_id || null,
      checklist_template_version_id: version.id,
      denetim_turu: parsed.data.denetim_turu,
      denetim_tarihi: parsed.data.denetim_tarihi,
      baslangic_saati: parsed.data.baslangic_saati || null,
      bitis_saati: parsed.data.bitis_saati || null,
      uzman_user_id: parsed.data.uzman_user_id,
      yetkili_contact_id: parsed.data.yetkili_contact_id || null,
      genel_notlar: parsed.data.genel_notlar || null,
      status: "draft",
      created_by: context.userId,
      updated_by: context.userId,
    })
    .select("id")
    .single();

  if (inspectionError || !inspection) {
    return { error: "Denetim oluşturulamadı: " + (inspectionError?.message ?? "") };
  }

  const responseRows = items.map((item, index) => ({
    inspection_id: inspection.id,
    checklist_item_id: item.id,
    organization_id: organizationId,
    sira_no: index + 1,
    soru_snapshot: item.soru,
    aciklama_snapshot: item.aciklama,
    regulation_metin_snapshot: item.regulation_versions?.madde_metni ?? null,
    regulation_reference_snapshot: item.regulation_versions
      ? `${item.regulation_versions.regulations?.mevzuat_adi ?? ""} — Madde ${item.regulation_versions.madde_no}`
      : null,
    sonuc: null,
  }));

  const { error: responsesError } = await supabase.from("inspection_responses").insert(responseRows);
  if (responsesError) return { error: "Denetim maddeleri oluşturulamadı: " + responsesError.message };

  redirect(`/denetimler/${inspection.id}`);
}
