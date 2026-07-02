import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/session";
import { OrganizationSettingsForm } from "./organization-settings-form";
import { NotificationSettingsForm } from "./notification-settings-form";
import { InviteUserDialog } from "./invite-user-dialog";
import { MembersTable } from "./members-table";

export default async function AyarlarPage() {
  const context = await requireUserContext();
  if (context.activeOrganization.role !== "organization_admin") redirect("/anasayfa");

  const organizationId = context.activeOrganization.organizationId;
  const supabase = await createClient();

  const [{ data: organization }, { data: notificationSettings }, { data: members }, { data: emails }] =
    await Promise.all([
      supabase.from("organizations").select("*").eq("id", organizationId).single(),
      supabase.from("notification_settings").select("*").eq("organization_id", organizationId).maybeSingle(),
      supabase
        .from("organization_members")
        .select("id, user_id, role, is_active")
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .order("created_at"),
      supabase.rpc("organization_member_emails", { org_id: organizationId }),
    ]);

  // organization_members.user_id -> auth.users; profiles de ayrıca aynı
  // auth.users'a referans verir ama aralarında doğrudan bir FK yoktur,
  // bu yüzden PostgREST embed edemez (bkz. CLAUDE.md — Denetim modülü
  // notlarındaki aynı desen). Ayrı bir sorguyla eşleştirilir.
  const userIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };
  const fullNameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const emailMap = new Map((emails ?? []).map((e) => [e.user_id, e.email]));
  const memberRows = (members ?? []).map((m) => ({
    id: m.id,
    fullName: fullNameMap.get(m.user_id) ?? null,
    email: emailMap.get(m.user_id) ?? null,
    role: m.role,
    isActive: m.is_active,
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-mesmer-text">Ayarlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kuruluş Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationSettingsForm
            defaultValues={{
              display_name: organization?.display_name ?? "",
              phone: organization?.phone ?? "",
              email: organization?.email ?? "",
              website: organization?.website ?? "",
              address: organization?.address ?? "",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bildirim Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettingsForm
            defaultValues={{
              gonderen_adi: notificationSettings?.gonderen_adi ?? "",
              yanit_adresi: notificationSettings?.yanit_adresi ?? "",
              default_cc: (notificationSettings?.default_cc ?? []).join("\n"),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Kullanıcılar</CardTitle>
          <InviteUserDialog />
        </CardHeader>
        <CardContent>
          <MembersTable members={memberRows} />
        </CardContent>
      </Card>
    </div>
  );
}
