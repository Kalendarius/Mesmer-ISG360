import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "./signup-form";

export default function KayitPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kayıt Ol</CardTitle>
        <CardDescription>
          Kendi kuruluşunuzu oluşturun — işletme, denetim ve uygunsuzluk verileriniz yalnızca sizin görebileceğiniz
          şekilde izole tutulur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  );
}
