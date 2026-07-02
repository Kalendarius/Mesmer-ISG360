import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { InspectionCreateForm } from "./inspection-create-form";

export default async function YeniDenetimPage() {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) redirect("/denetimler");

  const organizationId = context.activeOrganization.organizationId;
  const supabase = await createClient();

  const [
    { data: companies },
    { data: branches },
    { data: contacts },
    { data: templates },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, unvan")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("unvan"),
    supabase
      .from("company_branches")
      .select("id, company_id, sube_adi")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sube_adi"),
    supabase
      .from("company_contacts")
      .select("id, company_id, branch_id, ad_soyad")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("ad_soyad"),
    supabase
      .from("checklist_templates")
      .select("id, ad")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("ad"),
    supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .in("role", ["organization_admin", "safety_expert"]),
  ]);

  const expertIds = (members ?? []).map((m) => m.user_id);
  const { data: expertProfiles } = expertIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", expertIds)
    : { data: [] };

  const experts = (expertProfiles ?? []).map((p) => ({ id: p.id, name: p.full_name ?? "İsimsiz Kullanıcı" }));

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Denetim</CardTitle>
          <CardDescription>Denetim bilgilerini girin; kontrol maddeleri bir sonraki ekranda doldurulacak.</CardDescription>
        </CardHeader>
        <CardContent>
          <InspectionCreateForm
            companies={companies ?? []}
            branches={branches ?? []}
            contacts={contacts ?? []}
            templates={templates ?? []}
            experts={experts}
            defaultUzmanId={context.userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
