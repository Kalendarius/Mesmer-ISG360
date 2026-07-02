import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordForm } from "./reset-password-form";

export default function SifreSifirlaPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni Şifre Belirleyin</CardTitle>
        <CardDescription>Hesabınız için yeni bir şifre oluşturun.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  );
}
