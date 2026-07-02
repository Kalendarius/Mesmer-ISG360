import { describe, it, expect } from "vitest";
import { escapeHtml } from "./html";

describe("escapeHtml", () => {
  it("HTML özel karakterlerini escape eder", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("& karakterini doğru sırada escape eder (çift escape olmaz)", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("tırnak işaretlerini escape eder", () => {
    expect(escapeHtml(`"alıntı" ve 'tek tırnak'`)).toBe("&quot;alıntı&quot; ve &#39;tek tırnak&#39;");
  });

  it("normal Türkçe metni değiştirmeden bırakır", () => {
    expect(escapeHtml("İşyerinde acil durum planı hazırlanmış mı?")).toBe(
      "İşyerinde acil durum planı hazırlanmış mı?",
    );
  });
});
