import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./env";
import { E2E_TEST_EMAIL, E2E_COMPANY_PREFIX } from "./test-credentials";

export default async function globalTeardown() {
  loadEnvLocal();
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: companies } = await admin.from("companies").select("id").ilike("unvan", `${E2E_COMPANY_PREFIX}%`);
  const companyIds = (companies ?? []).map((c) => c.id);

  if (companyIds.length > 0) {
    const { data: inspections } = await admin.from("inspections").select("id").in("company_id", companyIds);
    const inspectionIds = (inspections ?? []).map((i) => i.id);

    const { data: findings } = await admin.from("findings").select("id").in("company_id", companyIds);
    const findingIds = (findings ?? []).map((f) => f.id);
    if (findingIds.length > 0) {
      await admin.from("corrective_actions").delete().in("finding_id", findingIds);
      await admin.from("finding_photos").delete().in("finding_id", findingIds);
      await admin.from("findings").delete().in("id", findingIds);
    }

    if (inspectionIds.length > 0) {
      await admin.from("inspection_responses").delete().in("inspection_id", inspectionIds);
      await admin.from("inspections").delete().in("id", inspectionIds);
    }

    await admin.from("company_contacts").delete().in("company_id", companyIds);
    await admin.from("company_branches").delete().in("company_id", companyIds);
    await admin.from("companies").delete().in("id", companyIds);
  }

  const { data: users } = await admin.auth.admin.listUsers();
  const testUser = users.users.find((u) => u.email === E2E_TEST_EMAIL);
  if (testUser) {
    await admin.from("audit_logs").delete().eq("actor_user_id", testUser.id);
    await admin.from("organization_members").delete().eq("user_id", testUser.id);
    await admin.from("profiles").delete().eq("id", testUser.id);
    await admin.auth.admin.deleteUser(testUser.id);
  }
}
