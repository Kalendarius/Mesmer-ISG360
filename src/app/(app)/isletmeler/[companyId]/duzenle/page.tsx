import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { CompanyForm } from "../../company-form";

interface PageProps {
  params: Promise<{ companyId: string }>;
}

export default async function IsletmeDuzenlePage({ params }: PageProps) {
  const context = await requireUserContext();
  const { companyId } = await params;

  if (!hasWriteAccess(context.activeOrganization.role)) {
    redirect(`/isletmeler/${companyId}`);
  }

  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!company) notFound();

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>İşletmeyi Düzenle</CardTitle>
          <CardDescription>{company.unvan}</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm
            companyId={company.id}
            defaultValues={{
              unvan: company.unvan,
              kisa_ad: company.kisa_ad ?? "",
              vergi_no: company.vergi_no ?? "",
              tehlike_sinifi: company.tehlike_sinifi ?? undefined,
              faaliyet_konusu: company.faaliyet_konusu ?? "",
              calisan_sayisi: company.calisan_sayisi != null ? String(company.calisan_sayisi) : "",
              telefon: company.telefon ?? "",
              eposta: company.eposta ?? "",
              website: company.website ?? "",
              notlar: company.notlar ?? "",
              is_active: company.is_active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
