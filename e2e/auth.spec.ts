import { test, expect } from "@playwright/test";
import { E2E_TEST_EMAIL, E2E_TEST_PASSWORD } from "./test-credentials";

test.describe("Giriş", () => {
  test("geçersiz kimlik bilgileriyle hata gösterir", async ({ page }) => {
    await page.goto("/giris");
    await page.getByLabel("E-posta").fill("olmayan@mesmermym.local");
    await page.getByLabel("Şifre").fill("yanlissifre123");
    await page.getByRole("button", { name: "Giriş Yap" }).click();
    await expect(page.getByText(/hatalı|geçersiz|bulunamadı/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/giris/);
  });

  test("geçerli kimlik bilgileriyle anasayfaya yönlendirir", async ({ page }) => {
    await page.goto("/giris");
    await page.getByLabel("E-posta").fill(E2E_TEST_EMAIL);
    await page.getByLabel("Şifre").fill(E2E_TEST_PASSWORD);
    await page.getByRole("button", { name: "Giriş Yap" }).click();
    await expect(page).toHaveURL(/anasayfa/, { timeout: 10_000 });
    await expect(page.getByText("Hoş geldiniz")).toBeVisible();
  });

  test("oturum açmadan korumalı sayfaya girilemez", async ({ page }) => {
    await page.goto("/anasayfa");
    await expect(page).toHaveURL(/giris/, { timeout: 10_000 });
  });
});
