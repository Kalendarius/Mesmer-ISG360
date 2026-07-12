"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { sendAndLogEmail } from "@/lib/email/send-email";
import { escapeHtml } from "@/lib/utils/html";
import {
  findingQuickSchema,
  inspectionHeaderSchema,
  responseUpdateSchema,
  toFindingRecord,
  toInspectionHeaderRecord,
  type FindingQuickInput,
  type InspectionHeaderInput,
  type ResponseUpdateInput,
} from "@/lib/validation/inspection";

export interface ActionResult {
  error?: string;
}

function assertWriteAccess(role: string): string | null {
  if (role !== "organization_admin" && role !== "safety_expert") {
    return "Bu işlem için yetkiniz yok.";
  }
  return null;
}

export async function updateResponseAction(
  inspectionId: string,
  responseId: string,
  input: ResponseUpdateInput,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = responseUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("inspection_responses")
    .update({ sonuc: parsed.data.sonuc, not_metni: parsed.data.not_metni || null })
    .eq("id", responseId);

  if (error) return { error: "Cevap kaydedilemedi: " + error.message };

  revalidatePath(`/denetimler/${inspectionId}`);
  return {};
}

/**
 * "Uygun Değil" seçimi ile uygunsuzluk oluşturmayı tek işlemde birleştirir:
 * kullanıcı formu iptal ederse cevap "Uygun Değil" olarak işaretlenmez.
 */
export async function markNonCompliantAction(
  inspectionId: string,
  responseId: string,
  input: FindingQuickInput,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = findingQuickSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const organizationId = context.activeOrganization.organizationId;

  const { data: inspection } = await supabase
    .from("inspections")
    .select("company_id, branch_id, companies(unvan), company_branches(sube_adi)")
    .eq("id", inspectionId)
    .single();
  if (!inspection) return { error: "Denetim bulunamadı." };

  const { data: response } = await supabase
    .from("inspection_responses")
    .select("regulation_metin_snapshot, checklist_items(is_certification_opportunity)")
    .eq("id", responseId)
    .single();

  const { data: finding, error: findingError } = await supabase
    .from("findings")
    .insert({
      ...toFindingRecord(parsed.data),
      organization_id: organizationId,
      inspection_id: inspectionId,
      inspection_response_id: responseId,
      company_id: inspection.company_id,
      branch_id: inspection.branch_id,
      regulation_metin_snapshot: response?.regulation_metin_snapshot ?? null,
      durum: "open",
      created_by: context.userId,
      updated_by: context.userId,
    })
    .select("id")
    .single();

  if (findingError || !finding) return { error: "Uygunsuzluk kaydedilemedi: " + findingError?.message };

  const { error: responseError } = await supabase
    .from("inspection_responses")
    .update({ sonuc: "non_compliant" })
    .eq("id", responseId);

  if (responseError) return { error: "Cevap güncellenemedi: " + responseError.message };

  if (response?.checklist_items?.is_certification_opportunity) {
    await notifyMykOpportunity(supabase, {
      organizationId,
      findingId: finding.id,
      companyUnvan: inspection.companies?.unvan ?? "",
      subeAdi: inspection.company_branches?.sube_adi ?? "",
      baslik: parsed.data.baslik,
      actorUserId: context.userId,
    });
  }

  revalidatePath(`/denetimler/${inspectionId}`);
  return {};
}

/**
 * MYK belgelendirme fırsatı dahili bildirimi — MESMER'in kendi iş modeli:
 * MESMER MYK onaylı bir belgelendirme kuruluşu ve bu uygulamayı TÜM
 * bağımsız İSG uzmanlarına/OSGB'lere dağıtıyor (bkz. CLAUDE.md → "Ne
 * inşa ediliyor"). is_certification_opportunity işaretli bir maddeden
 * HANGİ KURULUŞTA (hangi İSG uzmanının denetiminde) olursa olsun bir
 * uygunsuzluk doğduğunda, MESMER'in kendisi (platform sahibi olarak) bunu
 * bilmek istiyor — böylece o işletmeye gidip MYK sınavı/belgesi teklif
 * edebiliyor. Bu yüzden alıcı listesi kasıtlı olarak **sabit kodlanmış**
 * ve `notification_settings`'ten (kuruluşa özel, dolayısıyla her kuruluş
 * kendi mail'ini görürdü) OKUNMAZ — tüm kuruluşlar için aynı, platform
 * seviyesinde bir bildirimdir.
 */
const MYK_OPPORTUNITY_NOTIFICATION_RECIPIENTS = ["info@mesmermym.com", "orhun@mesmermym.com"];

async function notifyMykOpportunity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    organizationId: string;
    findingId: string;
    companyUnvan: string;
    subeAdi: string;
    baslik: string;
    actorUserId: string;
  },
) {
  const { data: organization } = await supabase
    .from("organizations")
    .select("display_name")
    .eq("id", params.organizationId)
    .single();

  const companyUnvan = escapeHtml(params.companyUnvan);
  const subeAdi = escapeHtml(params.subeAdi);
  const baslik = escapeHtml(params.baslik);
  const kuruluşAdi = escapeHtml(organization?.display_name ?? "");
  const html = `
    <p>Bir denetimde MYK belgelendirme fırsatı tespit edildi.</p>
    <p><strong>İşletme:</strong> ${companyUnvan}${subeAdi ? ` — ${subeAdi}` : ""}</p>
    <p><strong>Uygunsuzluk:</strong> ${baslik}</p>
    <p><strong>Denetimi yapan kuruluş:</strong> ${kuruluşAdi}</p>
  `.trim();

  await sendAndLogEmail(supabase, {
    organizationId: params.organizationId,
    findingId: params.findingId,
    to: MYK_OPPORTUNITY_NOTIFICATION_RECIPIENTS,
    subject: `MYK Belgelendirme Fırsatı — ${params.companyUnvan}`,
    html,
    gonderenUserId: params.actorUserId,
  });
}

export async function updateInspectionHeaderAction(
  inspectionId: string,
  input: InspectionHeaderInput,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = inspectionHeaderSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("inspections")
    .update({ ...toInspectionHeaderRecord(parsed.data), updated_by: context.userId })
    .eq("id", inspectionId);

  if (error) return { error: "Denetim güncellenemedi: " + error.message };

  revalidatePath(`/denetimler/${inspectionId}`);
  return {};
}

export async function completeInspectionAction(inspectionId: string): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();

  const { data: responses } = await supabase
    .from("inspection_responses")
    .select("id, sonuc, checklist_item_id, checklist_items(zorunlu)")
    .eq("inspection_id", inspectionId);

  const unansweredRequired = (responses ?? []).filter((r) => r.checklist_items?.zorunlu && !r.sonuc);
  if (unansweredRequired.length > 0) {
    return { error: `${unansweredRequired.length} zorunlu madde henüz cevaplanmadı.` };
  }

  const { error } = await supabase
    .from("inspections")
    .update({ status: "completed", completed_at: new Date().toISOString(), updated_by: context.userId })
    .eq("id", inspectionId);

  if (error) return { error: "Denetim tamamlanamadı: " + error.message };

  await logAudit(supabase, {
    organizationId: context.activeOrganization.organizationId,
    actorUserId: context.userId,
    action: "inspection.completed",
    entityType: "inspections",
    entityId: inspectionId,
    yeniVeri: { status: "completed" },
  });

  revalidatePath(`/denetimler/${inspectionId}`);
  revalidatePath("/denetimler");
  return {};
}

/** Yalnızca taslak (henüz tamamlanmamış) denetimler silinebilir — kayıt kalıcı silinmez, deleted_at işaretlenir. */
export async function deleteInspectionAction(inspectionId: string): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();

  const { data: inspection } = await supabase
    .from("inspections")
    .select("status")
    .eq("id", inspectionId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!inspection) return { error: "Denetim bulunamadı." };
  if (inspection.status !== "draft") return { error: "Yalnızca taslak denetimler silinebilir." };

  const { error } = await supabase
    .from("inspections")
    .update({ deleted_at: new Date().toISOString(), updated_by: context.userId })
    .eq("id", inspectionId);

  if (error) return { error: "Denetim silinemedi: " + error.message };

  await logAudit(supabase, {
    organizationId: context.activeOrganization.organizationId,
    actorUserId: context.userId,
    action: "inspection.deleted",
    entityType: "inspections",
    entityId: inspectionId,
  });

  revalidatePath("/denetimler");
  redirect("/denetimler");
}
