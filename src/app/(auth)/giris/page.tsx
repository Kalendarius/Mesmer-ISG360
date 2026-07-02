import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function GirisPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giriş Yap</CardTitle>
        <CardDescription>MESMER İSG360 hesabınızla oturum açın.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
