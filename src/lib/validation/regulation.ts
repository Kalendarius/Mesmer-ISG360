import { z } from "zod";

const optionalString = z.string().optional().or(z.literal(""));

export const regulationSchema = z.object({
  mevzuat_adi: z.string().min(1, "Mevzuat adı zorunludur."),
  mevzuat_turu: optionalString,
  is_active: z.boolean(),
});
export type RegulationInput = z.infer<typeof regulationSchema>;

export const maddeSchema = z.object({
  madde_no: z.string().min(1, "Madde numarası zorunludur."),
  madde_basligi: optionalString,
  madde_metni: z.string().min(1, "Madde metni zorunludur."),
  kaynak_url: optionalString,
  yururluk_tarihi: optionalString,
});
export type MaddeInput = z.infer<typeof maddeSchema>;

function nullIfEmpty(value: string | undefined): string | null {
  return value ? value : null;
}

export function toRegulationRecord(input: RegulationInput) {
  return {
    mevzuat_adi: input.mevzuat_adi,
    mevzuat_turu: nullIfEmpty(input.mevzuat_turu),
    is_active: input.is_active,
  };
}

export function toMaddeRecord(input: MaddeInput) {
  return {
    madde_no: input.madde_no,
    madde_basligi: nullIfEmpty(input.madde_basligi),
    madde_metni: input.madde_metni,
    kaynak_url: nullIfEmpty(input.kaynak_url),
    yururluk_tarihi: nullIfEmpty(input.yururluk_tarihi),
  };
}
