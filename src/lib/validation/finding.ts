import { z } from "zod";
import { FINDING_RISK_LEVELS, FINDING_STATUSES, PHOTO_TYPES } from "@/lib/utils/enums";

const optionalString = z.string().optional().or(z.literal(""));

export const findingUpdateSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur."),
  aciklama: optionalString,
  risk_seviyesi: z.enum(FINDING_RISK_LEVELS),
  termin_tarihi: optionalString,
  sorumlu_kisi_contact_id: optionalString,
  sorumlu_kisi_adi: optionalString,
});
export type FindingUpdateInput = z.infer<typeof findingUpdateSchema>;

function nullIfEmpty(value: string | undefined): string | null {
  return value ? value : null;
}

export function toFindingUpdateRecord(input: FindingUpdateInput) {
  return {
    baslik: input.baslik,
    aciklama: nullIfEmpty(input.aciklama),
    risk_seviyesi: input.risk_seviyesi,
    termin_tarihi: nullIfEmpty(input.termin_tarihi),
    sorumlu_kisi_contact_id: nullIfEmpty(input.sorumlu_kisi_contact_id),
    sorumlu_kisi_adi: nullIfEmpty(input.sorumlu_kisi_adi),
  };
}

export const findingStatusChangeSchema = z.object({
  yeni_durum: z.enum(FINDING_STATUSES),
  aciklama: z.string().min(1, "Bu durum değişikliği için bir açıklama girin."),
  kapatma_notu: optionalString,
});
export type FindingStatusChangeInput = z.infer<typeof findingStatusChangeSchema>;

export const photoRecordSchema = z.object({
  storage_path: z.string().min(1),
  tip: z.enum(PHOTO_TYPES),
});
export type PhotoRecordInput = z.infer<typeof photoRecordSchema>;
