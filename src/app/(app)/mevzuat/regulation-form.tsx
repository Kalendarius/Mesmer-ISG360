"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { regulationSchema, type RegulationInput } from "@/lib/validation/regulation";
import { createRegulationAction, updateRegulationAction } from "./actions";

interface RegulationFormProps {
  regulationId?: string;
  defaultValues?: Partial<RegulationInput>;
}

export function RegulationForm({ regulationId, defaultValues }: RegulationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegulationInput>({
    resolver: zodResolver(regulationSchema),
    defaultValues: { is_active: true, ...defaultValues },
  });

  const onSubmit = (data: RegulationInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = regulationId
        ? await updateRegulationAction(regulationId, data)
        : await createRegulationAction(data);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="mevzuat_adi">Mevzuat Adı *</Label>
        <Input id="mevzuat_adi" {...register("mevzuat_adi")} />
        {errors.mevzuat_adi && <p className="text-sm text-risk-high">{errors.mevzuat_adi.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mevzuat_turu">Mevzuat Türü</Label>
        <Input id="mevzuat_turu" placeholder="Kanun, Yönetmelik, Tebliğ..." {...register("mevzuat_turu")} />
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : regulationId ? "Değişiklikleri Kaydet" : "Mevzuatı Oluştur"}
      </Button>
    </form>
  );
}
