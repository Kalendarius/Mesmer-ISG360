"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth";
import { signUpAction } from "./actions";

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = (data: SignUpInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await signUpAction(data);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Ad Soyad</Label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        {errors.fullName && <p className="text-sm text-risk-high">{errors.fullName.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="companyName">Firma / Kuruluş Adı</Label>
        <Input id="companyName" autoComplete="organization" {...register("companyName")} />
        {errors.companyName && <p className="text-sm text-risk-high">{errors.companyName.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-risk-high">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-sm text-risk-high">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
        <Input id="passwordConfirm" type="password" autoComplete="new-password" {...register("passwordConfirm")} />
        {errors.passwordConfirm && <p className="text-sm text-risk-high">{errors.passwordConfirm.message}</p>}
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Kayıt Ol"}
      </Button>
      <p className="text-center text-sm text-mesmer-text-muted">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="text-mesmer-primary hover:underline">
          Giriş yapın
        </Link>
      </p>
    </form>
  );
}
