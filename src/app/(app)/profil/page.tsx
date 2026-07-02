import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requireUserContext } from "@/lib/auth/session";
import { USER_ROLE_LABELS } from "@/lib/utils/enums";
import { ProfileForm } from "./profile-form";

export default async function ProfilPage() {
  const context = await requireUserContext();

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profilim</CardTitle>
          <CardDescription>Kişisel bilgilerinizi görüntüleyin ve güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-mesmer-text-muted">E-posta</p>
              <p className="font-medium text-mesmer-text">{context.email}</p>
            </div>
            <div>
              <p className="text-mesmer-text-muted">Kuruluş</p>
              <p className="font-medium text-mesmer-text">
                {context.activeOrganization.organizationDisplayName}
              </p>
            </div>
            <div>
              <p className="text-mesmer-text-muted">Rol</p>
              <p className="font-medium text-mesmer-text">
                {USER_ROLE_LABELS[context.activeOrganization.role]}
              </p>
            </div>
          </div>
          <ProfileForm defaultValues={{ full_name: context.fullName ?? "", phone: context.phone ?? "" }} />
        </CardContent>
      </Card>
    </div>
  );
}
