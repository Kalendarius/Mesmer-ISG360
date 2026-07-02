"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/session";
import {
  categorySchema,
  itemSchema,
  toCategoryRecord,
  toItemRecord,
  type CategoryInput,
  type ItemInput,
} from "@/lib/validation/checklist";

export interface ActionResult {
  error?: string;
}

function assertWriteAccess(role: string): string | null {
  if (role !== "organization_admin" && role !== "safety_expert") {
    return "Bu işlem için yetkiniz yok.";
  }
  return null;
}

export async function createCategoryAction(
  templateId: string,
  versionId: string,
  input: CategoryInput,
  nextSiraNo: number,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_categories").insert({
    ...toCategoryRecord(parsed.data, nextSiraNo),
    checklist_template_version_id: versionId,
    organization_id: context.activeOrganization.organizationId,
  });

  if (error) return { error: "Kategori oluşturulamadı: " + error.message };

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}

export async function updateCategoryAction(
  templateId: string,
  categoryId: string,
  input: CategoryInput,
  currentSiraNo: number,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_categories")
    .update(toCategoryRecord(parsed.data, currentSiraNo))
    .eq("id", categoryId);

  if (error) return { error: "Kategori güncellenemedi: " + error.message };

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}

export async function deleteCategoryAction(templateId: string, categoryId: string): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();

  const { count } = await supabase
    .from("checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("checklist_category_id", categoryId)
    .is("deleted_at", null);

  if (count && count > 0) {
    return { error: "Bu kategoride kontrol maddeleri var; önce onları kaldırın." };
  }

  const { error } = await supabase.from("checklist_categories").delete().eq("id", categoryId);
  if (error) return { error: "Kategori silinemedi: " + error.message };

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}

export async function createItemAction(
  templateId: string,
  versionId: string,
  input: ItemInput,
  nextSiraNo: number,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").insert({
    ...toItemRecord(parsed.data, nextSiraNo),
    checklist_template_version_id: versionId,
    organization_id: context.activeOrganization.organizationId,
  });

  if (error) return { error: "Kontrol maddesi oluşturulamadı: " + error.message };

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}

export async function updateItemAction(
  templateId: string,
  itemId: string,
  input: ItemInput,
  currentSiraNo: number,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update(toItemRecord(parsed.data, currentSiraNo))
    .eq("id", itemId);

  if (error) return { error: "Kontrol maddesi güncellenemedi: " + error.message };

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}

export async function setItemActiveAction(
  templateId: string,
  itemId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").update({ is_active: isActive }).eq("id", itemId);

  if (error) return { error: "Durum güncellenemedi: " + error.message };

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}

/**
 * Mevcut güncel versiyonu (kategoriler + maddeler dahil) klonlayarak yeni
 * bir versiyon başlatır. Eski versiyon değişmeden kalır (geçmiş denetimler
 * onu referans alıyor olabilir); yeni versiyon düzenlemeye açık olur.
 */
export async function createNewVersionAction(templateId: string): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();

  const { data: currentVersion, error: versionFetchError } = await supabase
    .from("checklist_template_versions")
    .select("id, version_no")
    .eq("checklist_template_id", templateId)
    .eq("is_current", true)
    .single();

  if (versionFetchError || !currentVersion) {
    return { error: "Güncel versiyon bulunamadı." };
  }

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("checklist_categories")
      .select("*")
      .eq("checklist_template_version_id", currentVersion.id),
    supabase
      .from("checklist_items")
      .select("*")
      .eq("checklist_template_version_id", currentVersion.id)
      .is("deleted_at", null),
  ]);

  const { error: deactivateError } = await supabase
    .from("checklist_template_versions")
    .update({ is_current: false })
    .eq("id", currentVersion.id);
  if (deactivateError) return { error: "Eski versiyon kapatılamadı: " + deactivateError.message };

  const { data: newVersion, error: newVersionError } = await supabase
    .from("checklist_template_versions")
    .insert({
      checklist_template_id: templateId,
      organization_id: context.activeOrganization.organizationId,
      version_no: currentVersion.version_no + 1,
      is_current: true,
      notes: `Versiyon ${currentVersion.version_no}'dan kopyalandı.`,
      created_by: context.userId,
    })
    .select("id")
    .single();

  if (newVersionError || !newVersion) return { error: "Yeni versiyon oluşturulamadı." };

  const categoryIdMap = new Map<string, string>();
  for (const category of categories ?? []) {
    const { data: newCategory, error: categoryError } = await supabase
      .from("checklist_categories")
      .insert({
        checklist_template_version_id: newVersion.id,
        organization_id: context.activeOrganization.organizationId,
        ad: category.ad,
        sira_no: category.sira_no,
      })
      .select("id")
      .single();
    if (categoryError || !newCategory) return { error: "Kategoriler kopyalanamadı." };
    categoryIdMap.set(category.id, newCategory.id);
  }

  for (const item of items ?? []) {
    const newCategoryId = categoryIdMap.get(item.checklist_category_id);
    if (!newCategoryId) continue;
    const { error: itemError } = await supabase.from("checklist_items").insert({
      checklist_template_version_id: newVersion.id,
      checklist_category_id: newCategoryId,
      organization_id: context.activeOrganization.organizationId,
      soru: item.soru,
      aciklama: item.aciklama,
      sira_no: item.sira_no,
      regulation_version_id: item.regulation_version_id,
      standart_uygunsuzluk_aciklamasi: item.standart_uygunsuzluk_aciklamasi,
      onerilen_duzeltici_faaliyet: item.onerilen_duzeltici_faaliyet,
      varsayilan_risk_seviyesi: item.varsayilan_risk_seviyesi,
      zorunlu: item.zorunlu,
      fotograf_gerekli: item.fotograf_gerekli,
      is_certification_opportunity: item.is_certification_opportunity,
      is_active: item.is_active,
    });
    if (itemError) return { error: "Kontrol maddeleri kopyalanamadı: " + itemError.message };
  }

  revalidatePath(`/kontrol-listeleri/${templateId}`);
  return {};
}
