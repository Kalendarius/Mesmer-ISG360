import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { TemplateForm } from "../../template-form";

interface PageProps {
  params: Promise<{ templateId: string }>;
}

export default async function SablonDuzenlePage({ params }: PageProps) {
  const context = await requireUserContext();
  const { templateId } = await params;
  if (!hasWriteAccess(context.activeOrganization.role)) redirect(`/kontrol-listeleri/${templateId}`);

  const supabase = await createClient();
  const { data: template } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("id", templateId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!template) notFound();

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Şablonu Düzenle</CardTitle>
          <CardDescription>{template.ad}</CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm
            templateId={template.id}
            defaultValues={{
              ad: template.ad,
              sektor: template.sektor ?? "",
              faaliyet_konusu: template.faaliyet_konusu ?? "",
              denetim_turu: template.denetim_turu ?? undefined,
              is_active: template.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
