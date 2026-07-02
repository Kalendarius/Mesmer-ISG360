import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/utils/enums";

export interface OrganizationMembership {
  organizationId: string;
  organizationDisplayName: string;
  role: UserRole;
}

export interface UserContext {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  memberships: OrganizationMembership[];
  /** Aktif kuruluş: profildeki default_organization_id ya da ilk üyelik. */
  activeOrganization: OrganizationMembership;
}

/** Oturum yoksa null döner; yönlendirme yapmaz. */
export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, default_organization_id").eq("id", user.id).single(),
    supabase
      .from("organization_members")
      .select("organization_id, role, organizations(display_name)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .is("deleted_at", null),
  ]);

  const mapped: OrganizationMembership[] = (memberships ?? []).map((m) => ({
    organizationId: m.organization_id,
    organizationDisplayName: m.organizations?.display_name ?? "",
    role: m.role,
  }));

  if (mapped.length === 0) {
    // Kullanıcı hesabı var ama henüz hiçbir kuruluşa bağlanmamış.
    return null;
  }

  const activeOrganization =
    mapped.find((m) => m.organizationId === profile?.default_organization_id) ?? mapped[0];

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    memberships: mapped,
    activeOrganization,
  };
}

/** Oturum veya kuruluş üyeliği yoksa /giris'e yönlendirir. Sayfa/layout içinde kullanılır. */
export async function requireUserContext(): Promise<UserContext> {
  const context = await getUserContext();
  if (!context) redirect("/giris");
  return context;
}

/** Aktif kuruluşta yeterli role sahip değilse çağıran kod uygun hatayı üretmelidir. */
export function hasWriteAccess(role: UserRole): boolean {
  return role === "organization_admin" || role === "safety_expert";
}
