import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function SifremiUnuttumPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifremi Unuttum</CardTitle>
        <CardDescription>
          Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
