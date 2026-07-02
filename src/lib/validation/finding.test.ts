import { describe, it, expect } from "vitest";
import { findingUpdateSchema, findingStatusChangeSchema, toFindingUpdateRecord } from "./finding";

describe("findingUpdateSchema", () => {
  const valid = {
    baslik: "Başlık",
    aciklama: "",
    risk_seviyesi: "medium" as const,
    termin_tarihi: "",
    sorumlu_kisi_contact_id: "",
    sorumlu_kisi_adi: "",
  };

  it("geçerli girdiyi kabul eder", () => {
    expect(findingUpdateSchema.safeParse(valid).success).toBe(true);
  });

  it("boş başlığı reddeder", () => {
    expect(findingUpdateSchema.safeParse({ ...valid, baslik: "" }).success).toBe(false);
  });
});

describe("findingStatusChangeSchema", () => {
  it("açıklama zorunludur", () => {
    const result = findingStatusChangeSchema.safeParse({ yeni_durum: "in_progress", aciklama: "", kapatma_notu: "" });
    expect(result.success).toBe(false);
  });

  it("geçerli bir durum + açıklama kabul edilir", () => {
    const result = findingStatusChangeSchema.safeParse({
      yeni_durum: "in_progress",
      aciklama: "İnceleniyor",
      kapatma_notu: "",
    });
    expect(result.success).toBe(true);
  });

  it("kapatma_notu şema seviyesinde zorunlu değildir (iş kuralı action içinde kontrol edilir)", () => {
    const result = findingStatusChangeSchema.safeParse({
      yeni_durum: "closed_by_expert",
      aciklama: "Kapatıldı",
      kapatma_notu: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("toFindingUpdateRecord", () => {
  it("boş sorumlu_kisi_contact_id'yi null'a çevirir", () => {
    const record = toFindingUpdateRecord({
      baslik: "B",
      aciklama: "",
      risk_seviyesi: "low",
      termin_tarihi: "",
      sorumlu_kisi_contact_id: "",
      sorumlu_kisi_adi: "",
    });
    expect(record.sorumlu_kisi_contact_id).toBeNull();
    expect(record.termin_tarihi).toBeNull();
  });
});
