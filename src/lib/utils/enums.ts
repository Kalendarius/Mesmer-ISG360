/**
 * Veritabanı enum değerleri İngilizce/stabil token olarak tutulur (bkz.
 * supabase/migrations); Türkçe arayüz etiketleri tek kaynak olarak burada
 * tanımlanır. Yeni bir enum değeri eklenirse hem migration hem bu dosya
 * güncellenmelidir.
 */

export const USER_ROLES = [
  "organization_admin",
  "safety_expert",
  "viewer",
  "company_contact",
] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  organization_admin: "Kuruluş Yöneticisi",
  safety_expert: "İSG Uzmanı",
  viewer: "Görüntüleyici",
  company_contact: "İşletme Yetkilisi",
};

export const HAZARD_CLASSES = ["az_tehlikeli", "tehlikeli", "cok_tehlikeli"] as const;
export type HazardClass = (typeof HAZARD_CLASSES)[number];
export const HAZARD_CLASS_LABELS: Record<HazardClass, string> = {
  az_tehlikeli: "Az Tehlikeli",
  tehlikeli: "Tehlikeli",
  cok_tehlikeli: "Çok Tehlikeli",
};

export const INSPECTION_TYPES = [
  "periyodik",
  "sikayet_uzerine",
  "takip",
  "kaza_sonrasi",
  "diger",
] as const;
export type InspectionType = (typeof INSPECTION_TYPES)[number];
export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  periyodik: "Periyodik Denetim",
  sikayet_uzerine: "Şikayet Üzerine",
  takip: "Takip Denetimi",
  kaza_sonrasi: "Kaza Sonrası",
  diger: "Diğer",
};

export const INSPECTION_STATUSES = ["draft", "completed", "cancelled"] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];
export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  draft: "Taslak",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

export const RESPONSE_RESULTS = [
  "compliant",
  "non_compliant",
  "not_applicable",
  "not_checked",
] as const;
export type ResponseResult = (typeof RESPONSE_RESULTS)[number];
export const RESPONSE_RESULT_LABELS: Record<ResponseResult, string> = {
  compliant: "Uygun",
  non_compliant: "Uygun Değil",
  not_applicable: "Uygulanamaz",
  not_checked: "Kontrol Edilemedi",
};

export const FINDING_RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type FindingRiskLevel = (typeof FINDING_RISK_LEVELS)[number];
export const FINDING_RISK_LEVEL_LABELS: Record<FindingRiskLevel, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  critical: "Acil",
};

export const FINDING_STATUSES = [
  "open",
  "in_progress",
  "corrected_reported",
  "closed_by_expert",
  "overdue",
  "cancelled",
] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];
export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  open: "Açık",
  in_progress: "İşlemde",
  corrected_reported: "Düzeltildi Bildirildi",
  closed_by_expert: "Uzman Tarafından Kapatıldı",
  overdue: "Süresi Geçti",
  cancelled: "İptal Edildi",
};
/** Kapanmamış/iptal edilmemiş bulgu durumları — düzeltici faaliyet takibinde "açık" sayılır. */
export const OPEN_FINDING_STATUSES: readonly FindingStatus[] = ["open", "in_progress", "corrected_reported", "overdue"];

export const PHOTO_TYPES = ["detection", "correction", "other"] as const;
export type PhotoType = (typeof PHOTO_TYPES)[number];
export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  detection: "Tespit Fotoğrafı",
  correction: "Düzeltme Fotoğrafı",
  other: "Diğer",
};

export const EMAIL_STATUSES = ["sent", "failed"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];
export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  sent: "Başarılı",
  failed: "Başarısız",
};
