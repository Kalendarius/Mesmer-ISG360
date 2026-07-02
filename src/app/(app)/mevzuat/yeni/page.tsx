import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { RegulationForm } from "../regulation-form";

export default async function YeniMevzuatPage() {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) redirect("/mevzuat");

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Mevzuat</CardTitle>
          <CardDescription>
            Önce mevzuat başlığını oluşturun, ardından madde(ler)ini detay sayfasından ekleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegulationForm />
        </CardContent>
      </Card>
    </div>
  );
}
