import { z } from "zod";
import { FINDING_RISK_LEVELS, INSPECTION_TYPES, RESPONSE_RESULTS } from "@/lib/utils/enums";

const optionalString = z.string().optional().or(z.literal(""));

export const inspectionCreateSchema = z.object({
  company_id: z.string().min(1, "İşletme seçimi zorunludur."),
  branch_id: z.string().min(1, "Şube seçimi zorunludur."),
  checklist_template_id: z.string().min(1, "Kontrol listesi seçimi zorunludur."),
  denetim_turu: z.enum(INSPECTION_TYPES),
  denetim_tarihi: z.string().min(1, "Denetim tarihi zorunludur."),
  baslangic_saati: optionalString,
  bitis_saati: optionalString,
  uzman_user_id: z.string().min(1, "Denetimi yapan uzman seçimi zorunludur."),
  yetkili_contact_id: optionalString,
  genel_notlar: optionalString,
});
export type InspectionCreateInput = z.infer<typeof inspectionCreateSchema>;

export const responseUpdateSchema = z.object({
  sonuc: z.enum(RESPONSE_RESULTS).nullable(),
  not_metni: optionalString,
});
export type ResponseUpdateInput = z.infer<typeof responseUpdateSchema>;

export const findingQuickSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur."),
  aciklama: optionalString,
  risk_seviyesi: z.enum(FINDING_RISK_LEVELS),
  termin_tarihi: optionalString,
  sorumlu_kisi_adi: optionalString,
});
export type FindingQuickInput = z.infer<typeof findingQuickSchema>;

export const inspectionHeaderSchema = z.object({
  denetim_tarihi: z.string().min(1, "Denetim tarihi zorunludur."),
  baslangic_saati: optionalString,
  bitis_saati: optionalString,
  yetkili_contact_id: optionalString,
  genel_notlar: optionalString,
});
export type InspectionHeaderInput = z.infer<typeof inspectionHeaderSchema>;

function nullIfEmpty(value: string | undefined): string | null {
  return value ? value : null;
}

export function toInspectionHeaderRecord(input: InspectionHeaderInput) {
  return {
    denetim_tarihi: input.denetim_tarihi,
    baslangic_saati: nullIfEmpty(input.baslangic_saati),
    bitis_saati: nullIfEmpty(input.bitis_saati),
    yetkili_contact_id: nullIfEmpty(input.yetkili_contact_id),
    genel_notlar: nullIfEmpty(input.genel_notlar),
  };
}

export function toFindingRecord(input: FindingQuickInput) {
  return {
    baslik: input.baslik,
    aciklama: nullIfEmpty(input.aciklama),
    risk_seviyesi: input.risk_seviyesi,
    termin_tarihi: nullIfEmpty(input.termin_tarihi),
    sorumlu_kisi_adi: nullIfEmpty(input.sorumlu_kisi_adi),
  };
}
