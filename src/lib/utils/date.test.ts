import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatTime, todayIstanbulISODate } from "./date";

describe("formatDate", () => {
  it("GG.AA.YYYY formatına çevirir", () => {
    expect(formatDate("2026-01-05")).toBe("05.01.2026");
  });

  it("Date nesnesini de kabul eder", () => {
    expect(formatDate(new Date("2026-12-31T00:00:00Z"))).toBe("31.12.2026");
  });
});

describe("formatTime", () => {
  it("Europe/Istanbul saat dilimine göre HH:mm döner (UTC+3)", () => {
    // 09:00 UTC == 12:00 İstanbul (kış/yaz farkı olmadan sabit +3)
    expect(formatTime("2026-06-15T09:00:00Z")).toBe("12:00");
  });
});

describe("formatDateTime", () => {
  it("tarih ve saati birleştirir", () => {
    expect(formatDateTime("2026-06-15T09:30:00Z")).toBe("15.06.2026 12:30");
  });
});

describe("todayIstanbulISODate", () => {
  it("YYYY-AA-GG formatında bir tarih döner", () => {
    expect(todayIstanbulISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
