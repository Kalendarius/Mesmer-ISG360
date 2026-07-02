import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./env";
import { E2E_TEST_EMAIL, E2E_TEST_PASSWORD, E2E_COMPANY_PREFIX } from "./test-credentials";

export default async function globalSetup() {
  loadEnvLocal();
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: org } = await admin.from("organizations").select("id").limit(1).single();
  if (!org) throw new Error("e2e: kuruluş bulunamadı, önce supabase/seed.sql yüklenmeli.");

  // Önceki başarısız bir koşudan kalan test verisi varsa temizle.
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers.users.find((u) => u.email === E2E_TEST_EMAIL);
  if (existing) await admin.auth.admin.deleteUser(existing.id);

  const { data: staleCompanies } = await admin
    .from("companies")
    .select("id")
    .ilike("unvan", `${E2E_COMPANY_PREFIX}%`);
  if (staleCompanies && staleCompanies.length > 0) {
    const ids = staleCompanies.map((c) => c.id);
    await admin.from("companies").delete().in("id", ids);
  }

  const { data: userRes, error: userErr } = await admin.auth.admin.createUser({
    email: E2E_TEST_EMAIL,
    password: E2E_TEST_PASSWORD,
    email_confirm: true,
  });
  if (userErr || !userRes.user) throw new Error("e2e: test kullanıcısı oluşturulamadı: " + userErr?.message);

  await admin.from("profiles").update({ full_name: "E2E Test Kullanıcısı" }).eq("id", userRes.user.id);
  await admin.from("organization_members").insert({
    organization_id: org.id,
    user_id: userRes.user.id,
    role: "organization_admin",
    is_active: true,
  });
}
