import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * MESMER'in kendi kuruluşu — sistemdeki gerçek mevzuat metinlerinin
 * (mevzuat.gov.tr kaynaklı, kamu malı, telif sorunu yok) ve örnek kontrol
 * listesi şablonunun kaynağı. Yeni kayıt olan her kuruluşa başlangıç
 * içeriği olarak buradan kopyalanır (bkz. seed.sql).
 */
const STARTER_CONTENT_SOURCE_ORG_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Yeni kayıt olan bir kuruluşa MESMER'in gerçek mevzuat kütüphanesinin ve
 * örnek kontrol listesi şablonunun bir kopyasını oluşturur — kullanıcı
 * sıfırdan başlamak zorunda kalmaz. Yalnızca güncel (is_current/is_active)
 * içerik kopyalanır; geçmiş versiyonlar taşınmaz (yeni kuruluşun henüz
 * hiçbir denetim geçmişi olmadığından ihtiyaç yoktur).
 */
export async function cloneStarterContent(
  supabase: SupabaseClient<Database>,
  newOrganizationId: string,
  createdByUserId: string,
) {
  const { data: regulations } = await supabase
    .from("regulations")
    .select("*")
    .eq("organization_id", STARTER_CONTENT_SOURCE_ORG_ID)
    .eq("is_active", true)
    .is("deleted_at", null);

  const regulationIdMap = new Map<string, string>();
  for (const regulation of regulations ?? []) {
    const { data: newRegulation } = await supabase
      .from("regulations")
      .insert({
        organization_id: newOrganizationId,
        mevzuat_adi: regulation.mevzuat_adi,
        mevzuat_turu: regulation.mevzuat_turu,
        is_active: true,
      })
      .select("id")
      .single();
    if (newRegulation) regulationIdMap.set(regulation.id, newRegulation.id);
  }

  const regulationVersionIdMap = new Map<string, string>();
  if (regulationIdMap.size > 0) {
    const { data: versions } = await supabase
      .from("regulation_versions")
      .select("*")
      .in("regulation_id", [...regulationIdMap.keys()])
      .eq("is_current", true);

    for (const version of versions ?? []) {
      const newRegulationId = regulationIdMap.get(version.regulation_id);
      if (!newRegulationId) continue;
      const { data: newVersion } = await supabase
        .from("regulation_versions")
        .insert({
          regulation_id: newRegulationId,
          organization_id: newOrganizationId,
          version_no: version.version_no,
          madde_no: version.madde_no,
          madde_basligi: version.madde_basligi,
          madde_metni: version.madde_metni,
          kaynak_url: version.kaynak_url,
          yururluk_tarihi: version.yururluk_tarihi,
          is_current: true,
          created_by: createdByUserId,
        })
        .select("id")
        .single();
      if (newVersion) regulationVersionIdMap.set(version.id, newVersion.id);
    }
  }

  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("organization_id", STARTER_CONTENT_SOURCE_ORG_ID)
    .eq("is_active", true)
    .is("deleted_at", null);

  for (const template of templates ?? []) {
    const { data: newTemplate } = await supabase
      .from("checklist_templates")
      .insert({
        organization_id: newOrganizationId,
        ad: template.ad,
        sektor: template.sektor,
        faaliyet_konusu: template.faaliyet_konusu,
        denetim_turu: template.denetim_turu,
        is_active: true,
        created_by: createdByUserId,
        updated_by: createdByUserId,
      })
      .select("id")
      .single();
    if (!newTemplate) continue;

    const { data: currentVersion } = await supabase
      .from("checklist_template_versions")
      .select("*")
      .eq("checklist_template_id", template.id)
      .eq("is_current", true)
      .single();
    if (!currentVersion) continue;

    const { data: newVersion } = await supabase
      .from("checklist_template_versions")
      .insert({
        checklist_template_id: newTemplate.id,
        organization_id: newOrganizationId,
        version_no: 1,
        is_current: true,
        created_by: createdByUserId,
      })
      .select("id")
      .single();
    if (!newVersion) continue;

    const { data: categories } = await supabase
      .from("checklist_categories")
      .select("*")
      .eq("checklist_template_version_id", currentVersion.id)
      .order("sira_no");

    const categoryIdMap = new Map<string, string>();
    for (const category of categories ?? []) {
      const { data: newCategory } = await supabase
        .from("checklist_categories")
        .insert({
          checklist_template_version_id: newVersion.id,
          organization_id: newOrganizationId,
          ad: category.ad,
          sira_no: category.sira_no,
        })
        .select("id")
        .single();
      if (newCategory) categoryIdMap.set(category.id, newCategory.id);
    }

    const { data: items } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("checklist_template_version_id", currentVersion.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sira_no");

    for (const item of items ?? []) {
      const newCategoryId = categoryIdMap.get(item.checklist_category_id);
      if (!newCategoryId) continue;
      await supabase.from("checklist_items").insert({
        checklist_template_version_id: newVersion.id,
        checklist_category_id: newCategoryId,
        organization_id: newOrganizationId,
        soru: item.soru,
        aciklama: item.aciklama,
        sira_no: item.sira_no,
        regulation_version_id: item.regulation_version_id
          ? (regulationVersionIdMap.get(item.regulation_version_id) ?? null)
          : null,
        standart_uygunsuzluk_aciklamasi: item.standart_uygunsuzluk_aciklamasi,
        onerilen_duzeltici_faaliyet: item.onerilen_duzeltici_faaliyet,
        varsayilan_risk_seviyesi: item.varsayilan_risk_seviyesi,
        zorunlu: item.zorunlu,
        fotograf_gerekli: item.fotograf_gerekli,
        is_certification_opportunity: item.is_certification_opportunity,
        is_active: true,
      });
    }
  }
}
