"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { signInAction } from "./actions";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const linkError =
    searchParams.get("hata") === "baglanti-gecersiz"
      ? "Bağlantının süresi dolmuş veya geçersiz. Lütfen tekrar deneyin."
      : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signInAction(data, next);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {linkError && <p className="text-sm text-risk-high">{linkError}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-risk-high">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password && <p className="text-sm text-risk-high">{errors.password.message}</p>}
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
      <p className="text-center text-sm text-mesmer-text-muted">
        <Link href="/sifremi-unuttum" className="text-mesmer-primary hover:underline">
          Şifremi unuttum
        </Link>
      </p>
    </form>
  );
}
