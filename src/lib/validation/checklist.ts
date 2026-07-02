import { z } from "zod";
import { FINDING_RISK_LEVELS, INSPECTION_TYPES } from "@/lib/utils/enums";

const optionalString = z.string().optional().or(z.literal(""));

export const templateSchema = z.object({
  ad: z.string().min(1, "Şablon adı zorunludur."),
  sektor: optionalString,
  faaliyet_konusu: optionalString,
  denetim_turu: z.enum(INSPECTION_TYPES).optional(),
  is_active: z.boolean(),
});
export type TemplateInput = z.infer<typeof templateSchema>;

export const categorySchema = z.object({
  ad: z.string().min(1, "Kategori adı zorunludur."),
  sira_no: z.string().optional().or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const itemSchema = z.object({
  checklist_category_id: z.string().min(1, "Kategori seçimi zorunludur."),
  soru: z.string().min(1, "Soru zorunludur."),
  aciklama: optionalString,
  sira_no: z.string().optional().or(z.literal("")),
  regulation_version_id: optionalString,
  standart_uygunsuzluk_aciklamasi: optionalString,
  onerilen_duzeltici_faaliyet: optionalString,
  varsayilan_risk_seviyesi: z.enum(FINDING_RISK_LEVELS),
  zorunlu: z.boolean(),
  fotograf_gerekli: z.boolean(),
  is_certification_opportunity: z.boolean(),
  is_active: z.boolean(),
});
export type ItemInput = z.infer<typeof itemSchema>;

function nullIfEmpty(value: string | undefined): string | null {
  return value ? value : null;
}

function toInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function toTemplateRecord(input: TemplateInput) {
  return {
    ad: input.ad,
    sektor: nullIfEmpty(input.sektor),
    faaliyet_konusu: nullIfEmpty(input.faaliyet_konusu),
    denetim_turu: input.denetim_turu ?? null,
    is_active: input.is_active,
  };
}

export function toCategoryRecord(input: CategoryInput, fallbackSiraNo: number) {
  return {
    ad: input.ad,
    sira_no: toInt(input.sira_no, fallbackSiraNo),
  };
}

export function toItemRecord(input: ItemInput, fallbackSiraNo: number) {
  return {
    checklist_category_id: input.checklist_category_id,
    soru: input.soru,
    aciklama: nullIfEmpty(input.aciklama),
    sira_no: toInt(input.sira_no, fallbackSiraNo),
    regulation_version_id: nullIfEmpty(input.regulation_version_id),
    standart_uygunsuzluk_aciklamasi: nullIfEmpty(input.standart_uygunsuzluk_aciklamasi),
    onerilen_duzeltici_faaliyet: nullIfEmpty(input.onerilen_duzeltici_faaliyet),
    varsayilan_risk_seviyesi: input.varsayilan_risk_seviyesi,
    zorunlu: input.zorunlu,
    fotograf_gerekli: input.fotograf_gerekli,
    is_certification_opportunity: input.is_certification_opportunity,
    is_active: input.is_active,
  };
}
