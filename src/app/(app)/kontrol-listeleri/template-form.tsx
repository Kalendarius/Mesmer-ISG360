"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { templateSchema, type TemplateInput } from "@/lib/validation/checklist";
import { INSPECTION_TYPES, INSPECTION_TYPE_LABELS } from "@/lib/utils/enums";
import { createTemplateAction, updateTemplateAction } from "./actions";

interface TemplateFormProps {
  templateId?: string;
  defaultValues?: Partial<TemplateInput>;
}

export function TemplateForm({ templateId, defaultValues }: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: { is_active: true, ...defaultValues },
  });

  const onSubmit = (data: TemplateInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = templateId
        ? await updateTemplateAction(templateId, data)
        : await createTemplateAction(data);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="ad">Şablon Adı *</Label>
        <Input id="ad" {...register("ad")} />
        {errors.ad && <p className="text-sm text-risk-high">{errors.ad.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sektor">Sektör</Label>
          <Input id="sektor" {...register("sektor")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="faaliyet_konusu">Faaliyet Konusu</Label>
          <Input id="faaliyet_konusu" {...register("faaliyet_konusu")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="denetim_turu">Denetim Türü</Label>
          <Controller
            control={control}
            name="denetim_turu"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange} items={INSPECTION_TYPE_LABELS}>
                <SelectTrigger id="denetim_turu" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {INSPECTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {INSPECTION_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : templateId ? "Değişiklikleri Kaydet" : "Şablonu Oluştur"}
      </Button>
    </form>
  );
}
