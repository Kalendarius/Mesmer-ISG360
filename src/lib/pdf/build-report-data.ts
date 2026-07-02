import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
  HAZARD_CLASS_LABELS,
  INSPECTION_TYPE_LABELS,
  RESPONSE_RESULT_LABELS,
  FINDING_RISK_LEVEL_LABELS,
  FINDING_STATUS_LABELS,
  PHOTO_TYPE_LABELS,
  type HazardClass,
  type InspectionType,
  type ResponseResult,
  type FindingRiskLevel,
  type FindingStatus,
  type PhotoType,
} from "@/lib/utils/enums";
import { formatDate, formatDateTime } from "@/lib/utils/date";

export interface ReportResponseData {
  siraNo: number;
  soru: string;
  aciklama: string | null;
  regulationReference: string | null;
  sonuc: string | null;
  notMetni: string | null;
}

export interface ReportCategoryData {
  ad: string;
  siraNo: number;
  items: ReportResponseData[];
}

export interface ReportFindingPhotoData {
  storagePath: string;
  tip: string;
}

export interface ReportFindingData {
  baslik: string;
  aciklama: string | null;
  riskSeviyesi: string;
  durum: string;
  terminTarihi: string | null;
  sorumluKisiAdi: string | null;
  regulationMetinSnapshot: string | null;
  kapatmaNotu: string | null;
  kapatilmaTarihi: string | null;
  isCertificationOpportunity: boolean;
  photos: ReportFindingPhotoData[];
}

export interface ReportSummaryData {
  totalItems: number;
  compliant: number;
  nonCompliant: number;
  notApplicable: number;
  notChecked: number;
  openFindings: number;
  closedFindings: number;
}

export interface InspectionReportData {
  organization: {
    displayName: string;
    legalName: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
  };
  company: {
    unvan: string;
    vergiNo: string | null;
    tehlikeSinifiLabel: string | null;
    faaliyetKonusu: string | null;
  };
  branch: {
    subeAdi: string;
    adres: string | null;
    ilIlce: string | null;
  } | null;
  inspection: {
    denetimTuruLabel: string;
    denetimTarihi: string;
    baslangicSaati: string | null;
    bitisSaati: string | null;
    genelNotlar: string | null;
    uzmanAdi: string;
    yetkiliAdi: string | null;
    completedAtFormatted: string | null;
  };
  categories: ReportCategoryData[];
  findings: ReportFindingData[];
  summary: ReportSummaryData;
}

export async function buildInspectionReportData(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  inspectionId: string,
): Promise<InspectionReportData | null> {
  const { data: inspection } = await supabase
    .from("inspections")
    .select(
      "*, companies(unvan, vergi_no, tehlike_sinifi, faaliyet_konusu), company_branches(sube_adi, adres, il, ilce), company_contacts(ad_soyad)",
    )
    .eq("id", inspectionId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .single();

  if (!inspection) return null;

  const [{ data: organization }, { data: uzman }, { data: categories }, { data: responses }, { data: findings }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("display_name, legal_name, address, phone, email, website")
        .eq("id", organizationId)
        .single(),
      supabase.from("profiles").select("full_name").eq("id", inspection.uzman_user_id).single(),
      supabase
        .from("checklist_categories")
        .select("id, ad, sira_no")
        .eq("checklist_template_version_id", inspection.checklist_template_version_id)
        .order("sira_no"),
      supabase
        .from("inspection_responses")
        .select("sira_no, soru_snapshot, aciklama_snapshot, regulation_reference_snapshot, sonuc, not_metni, checklist_items(checklist_category_id)")
        .eq("inspection_id", inspectionId)
        .order("sira_no"),
      supabase
        .from("findings")
        .select(
          "baslik, aciklama, risk_seviyesi, durum, termin_tarihi, sorumlu_kisi_adi, regulation_metin_snapshot, kapatma_notu, kapatilma_tarihi, finding_photos(storage_path, tip), inspection_responses(checklist_items(is_certification_opportunity))",
        )
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null),
    ]);

  const categoryList: ReportCategoryData[] = (categories ?? []).map((c) => ({
    ad: c.ad,
    siraNo: c.sira_no,
    items: (responses ?? [])
      .filter((r) => r.checklist_items?.checklist_category_id === c.id)
      .map((r) => ({
        siraNo: r.sira_no,
        soru: r.soru_snapshot,
        aciklama: r.aciklama_snapshot,
        regulationReference: r.regulation_reference_snapshot,
        sonuc: r.sonuc ? RESPONSE_RESULT_LABELS[r.sonuc as ResponseResult] : null,
        notMetni: r.not_metni,
      })),
  }));

  const findingList: ReportFindingData[] = (findings ?? []).map((f) => ({
    baslik: f.baslik,
    aciklama: f.aciklama,
    riskSeviyesi: FINDING_RISK_LEVEL_LABELS[f.risk_seviyesi as FindingRiskLevel],
    durum: FINDING_STATUS_LABELS[f.durum as FindingStatus],
    terminTarihi: f.termin_tarihi ? formatDate(f.termin_tarihi) : null,
    sorumluKisiAdi: f.sorumlu_kisi_adi,
    regulationMetinSnapshot: f.regulation_metin_snapshot,
    kapatmaNotu: f.kapatma_notu,
    kapatilmaTarihi: f.kapatilma_tarihi ? formatDate(f.kapatilma_tarihi) : null,
    isCertificationOpportunity: f.inspection_responses?.checklist_items?.is_certification_opportunity ?? false,
    photos: (f.finding_photos ?? []).map((p) => ({
      storagePath: p.storage_path,
      tip: PHOTO_TYPE_LABELS[p.tip as PhotoType],
    })),
  }));

  const summary: ReportSummaryData = {
    totalItems: responses?.length ?? 0,
    compliant: (responses ?? []).filter((r) => r.sonuc === "compliant").length,
    nonCompliant: (responses ?? []).filter((r) => r.sonuc === "non_compliant").length,
    notApplicable: (responses ?? []).filter((r) => r.sonuc === "not_applicable").length,
    notChecked: (responses ?? []).filter((r) => r.sonuc === "not_checked").length,
    openFindings: (findings ?? []).filter((f) => f.durum !== "closed_by_expert" && f.durum !== "cancelled").length,
    closedFindings: (findings ?? []).filter((f) => f.durum === "closed_by_expert" || f.durum === "cancelled").length,
  };

  return {
    organization: {
      displayName: organization?.display_name ?? "",
      legalName: organization?.legal_name ?? "",
      address: organization?.address ?? null,
      phone: organization?.phone ?? null,
      email: organization?.email ?? null,
      website: organization?.website ?? null,
    },
    company: {
      unvan: inspection.companies?.unvan ?? "",
      vergiNo: inspection.companies?.vergi_no ?? null,
      tehlikeSinifiLabel: inspection.companies?.tehlike_sinifi
        ? HAZARD_CLASS_LABELS[inspection.companies.tehlike_sinifi as HazardClass]
        : null,
      faaliyetKonusu: inspection.companies?.faaliyet_konusu ?? null,
    },
    branch: inspection.company_branches
      ? {
          subeAdi: inspection.company_branches.sube_adi,
          adres: inspection.company_branches.adres ?? null,
          ilIlce: [inspection.company_branches.il, inspection.company_branches.ilce].filter(Boolean).join(" / ") || null,
        }
      : null,
    inspection: {
      denetimTuruLabel: INSPECTION_TYPE_LABELS[inspection.denetim_turu as InspectionType],
      denetimTarihi: formatDate(inspection.denetim_tarihi),
      baslangicSaati: inspection.baslangic_saati,
      bitisSaati: inspection.bitis_saati,
      genelNotlar: inspection.genel_notlar,
      uzmanAdi: uzman?.full_name ?? "—",
      yetkiliAdi: inspection.company_contacts?.ad_soyad ?? null,
      completedAtFormatted: inspection.completed_at ? formatDateTime(inspection.completed_at) : null,
    },
    categories: categoryList,
    findings: findingList,
    summary,
  };
}
