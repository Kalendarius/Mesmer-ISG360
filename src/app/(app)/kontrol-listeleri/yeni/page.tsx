import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { TemplateForm } from "../template-form";

export default async function YeniSablonPage() {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) redirect("/kontrol-listeleri");

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Kontrol Listesi Şablonu</CardTitle>
          <CardDescription>
            Şablonu oluşturduktan sonra kategori ve kontrol maddelerini detay sayfasından ekleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateForm />
        </CardContent>
      </Card>
    </div>
  );
}
