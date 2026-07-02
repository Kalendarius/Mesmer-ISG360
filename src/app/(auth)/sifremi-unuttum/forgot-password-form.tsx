"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/auth";
import { requestPasswordResetAction } from "./actions";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (data: ForgotPasswordInput) => {
    startTransition(async () => {
      const result = await requestPasswordResetAction(data);
      if (result.success) setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="space-y-4 text-sm">
        <p>
          Eğer bu e-posta adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı içeren bir e-posta
          gönderildi. Gelen kutunuzu kontrol edin.
        </p>
        <Link href="/giris" className="text-mesmer-primary hover:underline">
          Girişe dön
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-risk-high">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </Button>
      <p className="text-center text-sm text-mesmer-text-muted">
        <Link href="/giris" className="text-mesmer-primary hover:underline">
          Girişe dön
        </Link>
      </p>
    </form>
  );
}
