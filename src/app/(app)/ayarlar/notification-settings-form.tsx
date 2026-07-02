"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notificationSettingsSchema, type NotificationSettingsInput } from "@/lib/validation/organization";
import { updateNotificationSettingsAction } from "./actions";

export function NotificationSettingsForm({ defaultValues }: { defaultValues: NotificationSettingsInput }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationSettingsInput>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues,
  });

  const onSubmit = (data: NotificationSettingsInput) => {
    setFormError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateNotificationSettingsAction(data);
      if (result?.error) setFormError(result.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="gonderen_adi">Gönderen Adı</Label>
          <Input id="gonderen_adi" placeholder="MESMER İSG360" {...register("gonderen_adi")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="yanit_adresi">Yanıt Adresi</Label>
          <Input id="yanit_adresi" type="email" placeholder="info@mesmermym.com" {...register("yanit_adresi")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="default_cc">Rapor E-postalarında Varsayılan CC</Label>
          <Textarea
            id="default_cc"
            rows={2}
            placeholder="Her satıra veya virgülle ayırarak bir e-posta adresi girin"
            {...register("default_cc")}
          />
          {errors.default_cc && <p className="text-sm text-risk-high">{errors.default_cc.message}</p>}
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
