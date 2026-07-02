"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import {
  organizationSettingsSchema,
  notificationSettingsSchema,
  inviteUserSchema,
  toOrganizationRecord,
  toNotificationSettingsRecord,
  type OrganizationSettingsInput,
  type NotificationSettingsInput,
  type InviteUserInput,
} from "@/lib/validation/organization";

export interface ActionResult {
  error?: string;
}

function assertOrgAdmin(role: string): string | null {
  if (role !== "organization_admin") {
    return "Bu işlem yalnızca kuruluş yöneticileri tarafından yapılabilir.";
  }
  return null;
}

export async function updateOrganizationAction(input: OrganizationSettingsInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertOrgAdmin(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = organizationSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update(toOrganizationRecord(parsed.data))
    .eq("id", context.activeOrganization.organizationId);

  if (error) return { error: "Kuruluş bilgileri güncellenemedi: " + error.message };

  revalidatePath("/ayarlar");
  return {};
}

export async function updateNotificationSettingsAction(input: NotificationSettingsInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertOrgAdmin(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = notificationSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("notification_settings").upsert(
    {
      organization_id: context.activeOrganization.organizationId,
      ...toNotificationSettingsRecord(parsed.data),
    },
    { onConflict: "organization_id" },
  );

  if (error) return { error: "Bildirim ayarları güncellenemedi: " + error.message };

  revalidatePath("/ayarlar");
  return {};
}

/**
 * Yeni kullanıcı davet eder: auth.users kaydını `inviteUserByEmail` ile
 * oluşturur (yalnızca bu işlem için service-role gerekir) ve ardından
 * RLS'e tabi client ile organization_members satırını ekler. E-posta
 * şablonu (supabase/templates/invite.html) zaten /auth/confirm →
 * /sifre-sifirla akışına yönlendirecek şekilde yapılandırılmıştır.
 */
export async function inviteUserAction(input: InviteUserInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertOrgAdmin(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const organizationId = context.activeOrganization.organizationId;

  const { data: existingEmails } = await supabase.rpc("organization_member_emails", { org_id: organizationId });
  if (existingEmails?.some((m) => m.email?.toLowerCase() === parsed.data.email.toLowerCase())) {
    return { error: "Bu e-posta adresi zaten kuruluşunuzun bir üyesi." };
  }

  const admin = createAdminClient();
  const { data: inviteResult, error: inviteError } = await admin.auth.admin.inviteUserByEmail(parsed.data.email);
  if (inviteError || !inviteResult.user) {
    return { error: "Kullanıcı davet edilemedi: " + (inviteError?.message ?? "bilinmeyen hata") };
  }

  const { error: memberError } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    user_id: inviteResult.user.id,
    role: parsed.data.role,
    is_active: true,
    invited_by: context.userId,
  });

  if (memberError) return { error: "Kuruluş üyeliği eklenemedi: " + memberError.message };

  await logAudit(supabase, {
    organizationId,
    actorUserId: context.userId,
    action: "organization_member.invited",
    entityType: "organization_members",
    entityId: inviteResult.user.id,
    yeniVeri: { email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/ayarlar");
  return {};
}

export async function setMemberActiveAction(memberId: string, isActive: boolean): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertOrgAdmin(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ is_active: isActive })
    .eq("id", memberId)
    .eq("organization_id", context.activeOrganization.organizationId);

  if (error) return { error: "Üye durumu güncellenemedi: " + error.message };

  revalidatePath("/ayarlar");
  return {};
}
