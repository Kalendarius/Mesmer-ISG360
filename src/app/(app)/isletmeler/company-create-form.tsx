"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companyCreateSchema, MANDATORY_CONTACT_ROLES, type CompanyCreateInput } from "@/lib/validation/company";
import { HAZARD_CLASSES, HAZARD_CLASS_LABELS } from "@/lib/utils/enums";
import { createCompanyAction } from "./actions";

export function CompanyCreateForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanyCreateInput>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: { is_active: true },
  });

  const onSubmit = (data: CompanyCreateInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createCompanyAction(data);
      if (result?.error) setFormError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="unvan">Ticari Unvan *</Label>
          <Input id="unvan" {...register("unvan")} />
          {errors.unvan && <p className="text-sm text-risk-high">{errors.unvan.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kisa_ad">Kısa Ad</Label>
          <Input id="kisa_ad" {...register("kisa_ad")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="vergi_no">Vergi Numarası</Label>
          <Input id="vergi_no" {...register("vergi_no")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tehlike_sinifi">Tehlike Sınıfı</Label>
          <Controller
            control={control}
            name="tehlike_sinifi"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange} items={HAZARD_CLASS_LABELS}>
                <SelectTrigger id="tehlike_sinifi" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {HAZARD_CLASSES.map((h) => (
                    <SelectItem key={h} value={h}>
                      {HAZARD_CLASS_LABELS[h]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="faaliyet_konusu">Faaliyet Konusu</Label>
          <Input id="faaliyet_konusu" {...register("faaliyet_konusu")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="calisan_sayisi">Çalışan Sayısı</Label>
          <Input id="calisan_sayisi" type="number" min={0} {...register("calisan_sayisi")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefon">Telefon</Label>
          <Input id="telefon" type="tel" {...register("telefon")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="eposta">E-posta</Label>
          <Input id="eposta" type="email" {...register("eposta")} />
          {errors.eposta && <p className="text-sm text-risk-high">{errors.eposta.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website">Web Sitesi</Label>
          <Input id="website" {...register("website")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notlar">Notlar</Label>
          <Textarea id="notlar" rows={3} {...register("notlar")} />
        </div>
      </div>

      <div className="space-y-4 border-t border-mesmer-border pt-6">
        <div>
          <h2 className="text-sm font-semibold text-mesmer-text">Yetkililer</h2>
          <p className="text-sm text-mesmer-text-muted">
            Aşağıdaki 3 yetkilinin bilgileri işletme kaydı için zorunludur.
          </p>
        </div>
        {MANDATORY_CONTACT_ROLES.map(({ key, label }) => (
          <div key={key} className="space-y-3 rounded-md border border-mesmer-border p-4">
            <h3 className="text-sm font-medium text-mesmer-text">{label}</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor={`yetkililer.${key}.ad_soyad`}>Ad Soyad *</Label>
                <Input id={`yetkililer.${key}.ad_soyad`} {...register(`yetkililer.${key}.ad_soyad`)} />
                {errors.yetkililer?.[key]?.ad_soyad && (
                  <p className="text-sm text-risk-high">{errors.yetkililer[key]?.ad_soyad?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`yetkililer.${key}.eposta`}>E-posta</Label>
                <Input id={`yetkililer.${key}.eposta`} type="email" {...register(`yetkililer.${key}.eposta`)} />
                {errors.yetkililer?.[key]?.eposta && (
                  <p className="text-sm text-risk-high">{errors.yetkililer[key]?.eposta?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`yetkililer.${key}.telefon`}>Telefon</Label>
                <Input id={`yetkililer.${key}.telefon`} type="tel" {...register(`yetkililer.${key}.telefon`)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {formError && <p className="text-sm text-risk-high">{formError}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "İşletmeyi Oluştur"}
      </Button>
    </form>
  );
}
