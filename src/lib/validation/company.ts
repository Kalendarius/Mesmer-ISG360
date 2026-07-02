import { z } from "zod";
import { HAZARD_CLASSES } from "@/lib/utils/enums";

// Not: Form alanları HTML input'lardan gelir, bu yüzden şemalar bilerek
// string tabanlıdır (react-hook-form + zodResolver generic çıkarımını
// bozan z.preprocess/transform kullanılmaz). Sayısal alanlar ("" dahil)
// server action içinde DB'ye yazılmadan hemen önce dönüştürülür.

const optionalString = z.string().optional().or(z.literal(""));
const optionalEmail = z.string().email("Geçerli bir e-posta girin.").optional().or(z.literal(""));
const optionalNumericString = z.string().optional().or(z.literal(""));

export const companySchema = z.object({
  unvan: z.string().min(1, "Ticari unvan zorunludur."),
  kisa_ad: optionalString,
  vergi_no: optionalString,
  tehlike_sinifi: z.enum(HAZARD_CLASSES).optional(),
  faaliyet_konusu: optionalString,
  calisan_sayisi: optionalNumericString,
  telefon: optionalString,
  eposta: optionalEmail,
  website: optionalString,
  notlar: optionalString,
  is_active: z.boolean(),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const branchSchema = z.object({
  sube_adi: z.string().min(1, "Şube adı zorunludur."),
  adres: optionalString,
  il: optionalString,
  ilce: optionalString,
  lat: optionalNumericString,
  lng: optionalNumericString,
  calisan_sayisi: optionalNumericString,
  yetkili_kisi: optionalString,
  yetkili_eposta: optionalEmail,
  yetkili_telefon: optionalString,
  is_active: z.boolean(),
});
export type BranchInput = z.infer<typeof branchSchema>;

export const contactSchema = z.object({
  branch_id: optionalString,
  ad_soyad: z.string().min(1, "Ad soyad zorunludur."),
  gorev: optionalString,
  eposta: optionalEmail,
  telefon: optionalString,
  bildirim_alsin: z.boolean(),
  ana_yetkili: z.boolean(),
  is_active: z.boolean(),
});
export type ContactInput = z.infer<typeof contactSchema>;

/** İşletme kaydı tamamlanmadan doldurulması zorunlu 3 sabit yetkili rolü. */
export const MANDATORY_CONTACT_ROLES = [
  { key: "isveren", label: "İşveren" },
  { key: "ik_yetkilisi", label: "İK Yetkilisi" },
  { key: "uretim_sef", label: "Üretim Mühendisi / Şantiye Şefi" },
] as const;
export type MandatoryContactRoleKey = (typeof MANDATORY_CONTACT_ROLES)[number]["key"];

const mandatoryContactFieldSchema = z.object({
  ad_soyad: z.string().min(1, "Ad soyad zorunludur."),
  eposta: optionalEmail,
  telefon: optionalString,
});
export type MandatoryContactFieldInput = z.infer<typeof mandatoryContactFieldSchema>;

export const companyCreateSchema = companySchema.extend({
  yetkililer: z.object({
    isveren: mandatoryContactFieldSchema,
    ik_yetkilisi: mandatoryContactFieldSchema,
    uretim_sef: mandatoryContactFieldSchema,
  }),
});
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;

function toNullableInt(value: string | undefined): number | null {
  if (!value || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function toNullableFloat(value: string | undefined): number | null {
  if (!value || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function nullIfEmpty(value: string | undefined): string | null {
  return value ? value : null;
}

/** Form değerlerini (string tabanlı) DB'ye yazılacak biçime dönüştürür. */
export function toCompanyRecord(input: CompanyInput) {
  return {
    unvan: input.unvan,
    kisa_ad: nullIfEmpty(input.kisa_ad),
    vergi_no: nullIfEmpty(input.vergi_no),
    tehlike_sinifi: input.tehlike_sinifi ?? null,
    faaliyet_konusu: nullIfEmpty(input.faaliyet_konusu),
    calisan_sayisi: toNullableInt(input.calisan_sayisi),
    telefon: nullIfEmpty(input.telefon),
    eposta: nullIfEmpty(input.eposta),
    website: nullIfEmpty(input.website),
    notlar: nullIfEmpty(input.notlar),
    is_active: input.is_active,
  };
}

export function toBranchRecord(input: BranchInput) {
  return {
    sube_adi: input.sube_adi,
    adres: nullIfEmpty(input.adres),
    il: nullIfEmpty(input.il),
    ilce: nullIfEmpty(input.ilce),
    lat: toNullableFloat(input.lat),
    lng: toNullableFloat(input.lng),
    calisan_sayisi: toNullableInt(input.calisan_sayisi),
    yetkili_kisi: nullIfEmpty(input.yetkili_kisi),
    yetkili_eposta: nullIfEmpty(input.yetkili_eposta),
    yetkili_telefon: nullIfEmpty(input.yetkili_telefon),
    is_active: input.is_active,
  };
}

export function toContactRecord(input: ContactInput) {
  return {
    branch_id: nullIfEmpty(input.branch_id),
    ad_soyad: input.ad_soyad,
    gorev: nullIfEmpty(input.gorev),
    eposta: nullIfEmpty(input.eposta),
    telefon: nullIfEmpty(input.telefon),
    bildirim_alsin: input.bildirim_alsin,
    ana_yetkili: input.ana_yetkili,
    is_active: input.is_active,
  };
}

/** İşletme oluşturma formundaki 3 sabit yetkili alanını company_contacts satırlarına çevirir. */
export function toMandatoryContactRecords(input: CompanyCreateInput) {
  return MANDATORY_CONTACT_ROLES.map(({ key, label }) => {
    const c = input.yetkililer[key];
    return {
      branch_id: null,
      ad_soyad: c.ad_soyad,
      gorev: label,
      eposta: nullIfEmpty(c.eposta),
      telefon: nullIfEmpty(c.telefon),
      bildirim_alsin: true,
      ana_yetkili: key === "isveren",
      is_active: true,
    };
  });
}
