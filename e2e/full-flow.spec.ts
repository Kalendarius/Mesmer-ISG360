import { test, expect, type Page } from "@playwright/test";
import { E2E_TEST_EMAIL, E2E_TEST_PASSWORD, E2E_COMPANY_PREFIX } from "./test-credentials";

async function login(page: Page) {
  await page.goto("/giris");
  await page.getByLabel("E-posta").fill(E2E_TEST_EMAIL);
  await page.getByLabel("Şifre").fill(E2E_TEST_PASSWORD);
  await page.getByRole("button", { name: "Giriş Yap" }).click();
  await expect(page).toHaveURL(/anasayfa/, { timeout: 10_000 });
}

async function selectOption(page: Page, triggerId: string, optionName: string | RegExp) {
  await page.locator(`#${triggerId}`).click();
  await page.getByRole("option", { name: optionName }).click();
}

const companyName = `${E2E_COMPANY_PREFIX} Uçtan Uca Fabrikası`;

test.describe.serial("Uçtan uca denetim akışı", () => {
  test("işletme ve şube oluşturulur", async ({ page }) => {
    await login(page);

    await page.goto("/isletmeler/yeni");
    await page.locator("#unvan").fill(companyName);
    await page.getByRole("button", { name: "İşletmeyi Oluştur" }).click();
    await expect(page).toHaveURL(/\/isletmeler\/[a-f0-9-]+$/, { timeout: 10_000 });
    await expect(page.getByText(companyName, { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Şube Ekle" }).click();
    await page.locator("#sube_adi").fill("Merkez Şube");
    await page.getByRole("button", { name: "Şubeyi Oluştur" }).click();
    await expect(page.getByText("Merkez Şube")).toBeVisible({ timeout: 10_000 });
  });

  test("denetim oluşturulur, uygunsuzluk kaydedilir ve tamamlanır", async ({ page }) => {
    await login(page);

    await page.goto("/denetimler/yeni");
    await selectOption(page, "company_id", companyName);
    await selectOption(page, "branch_id", "Merkez Şube");
    await selectOption(page, "checklist_template_id", /Genel İSG Denetimi/);
    await page.getByRole("button", { name: "Denetimi Başlat" }).click();
    await expect(page).toHaveURL(/\/denetimler\/[a-f0-9-]+$/, { timeout: 10_000 });

    // İlk maddeyi "Uygun Değil" işaretle — uygunsuzluk diyaloğu açılır.
    const firstItemNonCompliant = page.getByRole("button", { name: "Uygun Değil" }).first();
    await firstItemNonCompliant.click();
    await expect(page.getByRole("dialog", { name: "Uygunsuzluk Kaydı" })).toBeVisible();
    await page.getByRole("button", { name: "Uygunsuzluğu Kaydet" }).click();
    await expect(page.getByRole("dialog", { name: "Uygunsuzluk Kaydı" })).not.toBeVisible({ timeout: 10_000 });

    // Kalan tüm maddeleri "Uygun" işaretle.
    const compliantButtons = page.getByRole("button", { name: "Uygun", exact: true });
    const count = await compliantButtons.count();
    for (let i = 0; i < count; i++) {
      await compliantButtons.nth(i).click();
      await page.waitForTimeout(150);
    }

    await expect(page.getByText(/9\/9 madde cevaplandı/)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Denetimi Tamamla" }).click();
    await expect(page.getByText("Tamamlandı")).toBeVisible({ timeout: 10_000 });
  });

  test("oluşan uygunsuzluk listede ve ana sayfada görünür", async ({ page }) => {
    await login(page);

    await page.goto("/uygunsuzluklar");
    await expect(page.getByText(companyName)).toBeVisible({ timeout: 10_000 });

    await page.goto("/anasayfa");
    const openFindingCard = page.getByRole("link", { name: /Açık Uygunsuzluk/ });
    await expect(openFindingCard).toBeVisible();
    await expect(openFindingCard.getByText(/^[1-9]\d*$/)).toBeVisible();
  });
});
