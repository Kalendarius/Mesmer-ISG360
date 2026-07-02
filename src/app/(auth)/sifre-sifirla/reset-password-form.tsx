"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";
import { resetPasswordAction } from "./actions";

export function ResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = (data: ResetPasswordInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(data);
      if (result.error) {
        setFormError(result.error);
        return;
      }
      router.push("/anasayfa");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="password">Yeni Şifre</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-sm text-risk-high">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="passwordConfirm">Yeni Şifre (Tekrar)</Label>
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          {...register("passwordConfirm")}
        />
        {errors.passwordConfirm && <p className="text-sm text-risk-high">{errors.passwordConfirm.message}</p>}
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Şifreyi Kaydet"}
      </Button>
    </form>
  );
}
