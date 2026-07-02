"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema, type ProfileInput } from "@/lib/validation/auth";
import { updateProfileAction } from "./actions";

interface ProfileFormProps {
  defaultValues: ProfileInput;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), defaultValues });

  const onSubmit = (data: ProfileInput) => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Profil bilgileriniz güncellendi." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Ad Soyad</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && <p className="text-sm text-risk-high">{errors.full_name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" type="tel" placeholder="05xx xxx xx xx" {...register("phone")} />
      </div>
      {message && (
        <p className={"text-sm " + (message.type === "success" ? "text-risk-compliant" : "text-risk-high")}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
