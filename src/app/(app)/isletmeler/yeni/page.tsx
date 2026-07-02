import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { CompanyCreateForm } from "../company-create-form";

export default async function YeniIsletmePage() {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    redirect("/isletmeler");
  }

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni İşletme</CardTitle>
          <CardDescription>Yeni bir işletme kaydı oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}
