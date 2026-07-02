"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { organizationSettingsSchema, type OrganizationSettingsInput } from "@/lib/validation/organization";
import { updateOrganizationAction } from "./actions";

export function OrganizationSettingsForm({ defaultValues }: { defaultValues: OrganizationSettingsInput }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationSettingsInput>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: OrganizationSettingsInput) => {
    setFormError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateOrganizationAction(data);
      if (result?.error) setFormError(result.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="display_name">Görünen Ad *</Label>
          <Input id="display_name" {...register("display_name")} />
          {errors.display_name && <p className="text-sm text-risk-high">{errors.display_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" type="tel" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website">Web Sitesi</Label>
          <Input id="website" {...register("website")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">Adres</Label>
          <Textarea id="address" rows={2} {...register("address")} />
        </div>
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      {saved && !formError && <p className="text-sm text-risk-compliant">Kaydedildi.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
