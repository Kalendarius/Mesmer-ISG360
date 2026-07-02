import { describe, it, expect } from "vitest";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, profileSchema } from "./auth";

describe("loginSchema", () => {
  it("geçerli e-posta/şifre kabul eder", () => {
    const result = loginSchema.safeParse({ email: "test@mesmermym.com", password: "sifre123" });
    expect(result.success).toBe(true);
  });

  it("geçersiz e-postayı reddeder", () => {
    const result = loginSchema.safeParse({ email: "gecersiz", password: "sifre123" });
    expect(result.success).toBe(false);
  });

  it("boş şifreyi reddeder", () => {
    const result = loginSchema.safeParse({ email: "test@mesmermym.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("geçerli e-postayı kabul eder", () => {
    expect(forgotPasswordSchema.safeParse({ email: "test@mesmermym.com" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("eşleşen şifreleri kabul eder", () => {
    const result = resetPasswordSchema.safeParse({ password: "sifre1234", passwordConfirm: "sifre1234" });
    expect(result.success).toBe(true);
  });

  it("eşleşmeyen şifreleri reddeder", () => {
    const result = resetPasswordSchema.safeParse({ password: "sifre1234", passwordConfirm: "farkli1234" });
    expect(result.success).toBe(false);
  });

  it("8 karakterden kısa şifreyi reddeder", () => {
    const result = resetPasswordSchema.safeParse({ password: "kisa", passwordConfirm: "kisa" });
    expect(result.success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("ad soyad zorunlu, telefon opsiyonel (boş string geçerli)", () => {
    expect(profileSchema.safeParse({ full_name: "Ali Veli", phone: "" }).success).toBe(true);
    expect(profileSchema.safeParse({ full_name: "", phone: "" }).success).toBe(false);
  });
});
