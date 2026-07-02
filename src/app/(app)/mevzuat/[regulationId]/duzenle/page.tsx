import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { RegulationForm } from "../../regulation-form";

interface PageProps {
  params: Promise<{ regulationId: string }>;
}

export default async function MevzuatDuzenlePage({ params }: PageProps) {
  const context = await requireUserContext();
  const { regulationId } = await params;
  if (!hasWriteAccess(context.activeOrganization.role)) redirect(`/mevzuat/${regulationId}`);

  const supabase = await createClient();
  const { data: regulation } = await supabase
    .from("regulations")
    .select("*")
    .eq("id", regulationId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!regulation) notFound();

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mevzuatı Düzenle</CardTitle>
          <CardDescription>{regulation.mevzuat_adi}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegulationForm
            regulationId={regulation.id}
            defaultValues={{
              mevzuat_adi: regulation.mevzuat_adi,
              mevzuat_turu: regulation.mevzuat_turu ?? "",
              is_active: regulation.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
