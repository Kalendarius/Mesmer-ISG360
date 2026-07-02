import { describe, it, expect } from "vitest";
import {
  inspectionCreateSchema,
  responseUpdateSchema,
  findingQuickSchema,
  inspectionHeaderSchema,
  toInspectionHeaderRecord,
  toFindingRecord,
} from "./inspection";

describe("inspectionCreateSchema", () => {
  const valid = {
    company_id: "c1",
    branch_id: "b1",
    checklist_template_id: "t1",
    denetim_turu: "periyodik" as const,
    denetim_tarihi: "2026-07-01",
    baslangic_saati: "",
    bitis_saati: "",
    uzman_user_id: "u1",
    yetkili_contact_id: "",
    genel_notlar: "",
  };

  it("geçerli girdiyi kabul eder", () => {
    expect(inspectionCreateSchema.safeParse(valid).success).toBe(true);
  });

  it("işletme seçilmeden geçersiz sayar", () => {
    const result = inspectionCreateSchema.safeParse({ ...valid, company_id: "" });
    expect(result.success).toBe(false);
  });

  it("şube seçilmeden de geçerli sayar (opsiyonel)", () => {
    const result = inspectionCreateSchema.safeParse({ ...valid, branch_id: "" });
    expect(result.success).toBe(true);
  });

  it("geçersiz denetim_turu değerini reddeder", () => {
    const result = inspectionCreateSchema.safeParse({ ...valid, denetim_turu: "gecersiz" });
    expect(result.success).toBe(false);
  });
});

describe("responseUpdateSchema", () => {
  it("null sonuç (cevaplanmamış) kabul edilir", () => {
    expect(responseUpdateSchema.safeParse({ sonuc: null, not_metni: "" }).success).toBe(true);
  });

  it("geçerli bir sonuç değeri kabul edilir", () => {
    expect(responseUpdateSchema.safeParse({ sonuc: "compliant", not_metni: "not" }).success).toBe(true);
  });

  it("geçersiz bir sonuç değeri reddedilir", () => {
    expect(responseUpdateSchema.safeParse({ sonuc: "gecersiz", not_metni: "" }).success).toBe(false);
  });
});

describe("findingQuickSchema", () => {
  it("yalnızca başlık ve risk seviyesiyle geçerlidir", () => {
    const result = findingQuickSchema.safeParse({ baslik: "Test başlığı", risk_seviyesi: "high" });
    expect(result.success).toBe(true);
  });

  it("boş başlığı reddeder", () => {
    const result = findingQuickSchema.safeParse({ baslik: "", risk_seviyesi: "high" });
    expect(result.success).toBe(false);
  });
});

describe("toInspectionHeaderRecord", () => {
  it("boş string alanları null'a çevirir", () => {
    const record = toInspectionHeaderRecord({
      denetim_tarihi: "2026-07-01",
      baslangic_saati: "",
      bitis_saati: "",
      yetkili_contact_id: "",
      genel_notlar: "",
    });
    expect(record.baslangic_saati).toBeNull();
    expect(record.yetkili_contact_id).toBeNull();
    expect(record.denetim_tarihi).toBe("2026-07-01");
  });
});

describe("toFindingRecord", () => {
  it("boş sorumlu_kisi_adi'yı null'a çevirir, doluysa korur", () => {
    const record = toFindingRecord({ baslik: "B", risk_seviyesi: "low", sorumlu_kisi_adi: "" });
    expect(record.sorumlu_kisi_adi).toBeNull();

    const record2 = toFindingRecord({ baslik: "B", risk_seviyesi: "low", sorumlu_kisi_adi: "Ali Veli" });
    expect(record2.sorumlu_kisi_adi).toBe("Ali Veli");
  });
});

describe("inspectionHeaderSchema", () => {
  it("denetim tarihi zorunludur", () => {
    const result = inspectionHeaderSchema.safeParse({
      denetim_tarihi: "",
      baslangic_saati: "",
      bitis_saati: "",
      yetkili_contact_id: "",
      genel_notlar: "",
    });
    expect(result.success).toBe(false);
  });
});
