"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
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
import { findingUpdateSchema, type FindingUpdateInput } from "@/lib/validation/finding";
import { FINDING_RISK_LEVELS, FINDING_RISK_LEVEL_LABELS } from "@/lib/utils/enums";
import { updateFindingAction } from "./actions";

interface ContactOption {
  id: string;
  ad_soyad: string;
}

interface FindingEditFormProps {
  findingId: string;
  contacts: ContactOption[];
  defaultValues: FindingUpdateInput;
}

const SERBEST_METIN = "serbest";

export function FindingEditForm({ findingId, contacts, defaultValues }: FindingEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FindingUpdateInput>({
    resolver: zodResolver(findingUpdateSchema),
    defaultValues: {
      ...defaultValues,
      sorumlu_kisi_contact_id: defaultValues.sorumlu_kisi_contact_id || SERBEST_METIN,
    },
  });

  const contactSelection = useWatch({ control, name: "sorumlu_kisi_contact_id" });
  const contactItems = Object.fromEntries(contacts.map((c) => [c.id, c.ad_soyad]));

  const onSubmit = (data: FindingUpdateInput) => {
    setFormError(null);
    const isFreeText = !data.sorumlu_kisi_contact_id || data.sorumlu_kisi_contact_id === SERBEST_METIN;
    const payload: FindingUpdateInput = {
      ...data,
      sorumlu_kisi_contact_id: isFreeText ? "" : data.sorumlu_kisi_contact_id,
      sorumlu_kisi_adi: isFreeText
        ? data.sorumlu_kisi_adi
        : (contacts.find((c) => c.id === data.sorumlu_kisi_contact_id)?.ad_soyad ?? ""),
    };
    startTransition(async () => {
      const result = await updateFindingAction(findingId, payload);
      if (result?.error) setFormError(result.error);
      else setSavedAt(Date.now());
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="baslik">Başlık *</Label>
        <Input id="baslik" {...register("baslik")} />
        {errors.baslik && <p className="text-sm text-risk-high">{errors.baslik.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="aciklama">Açıklama</Label>
        <Textarea id="aciklama" rows={3} {...register("aciklama")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="risk_seviyesi">Risk Seviyesi *</Label>
          <Controller
            control={control}
            name="risk_seviyesi"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} items={FINDING_RISK_LEVEL_LABELS}>
                <SelectTrigger id="risk_seviyesi" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {FINDING_RISK_LEVELS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {FINDING_RISK_LEVEL_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="termin_tarihi">Termin Tarihi</Label>
          <Input id="termin_tarihi" type="date" {...register("termin_tarihi")} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sorumlu_kisi_contact_id">Sorumlu Kişi</Label>
          <Controller
            control={control}
            name="sorumlu_kisi_contact_id"
            render={({ field }) => (
              <Select
                value={field.value || SERBEST_METIN}
                onValueChange={field.onChange}
                items={{ [SERBEST_METIN]: "Serbest metin gir", ...contactItems }}
              >
                <SelectTrigger id="sorumlu_kisi_contact_id" className="w-full">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SERBEST_METIN}>Serbest metin gir</SelectItem>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.ad_soyad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {(!contactSelection || contactSelection === SERBEST_METIN) && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sorumlu_kisi_adi">Sorumlu Kişi Adı</Label>
            <Input id="sorumlu_kisi_adi" {...register("sorumlu_kisi_adi")} />
          </div>
        )}
      </div>
      {formError && <p className="text-sm text-risk-high">{formError}</p>}
      {savedAt && !formError && <p className="text-sm text-risk-compliant">Kaydedildi.</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
      </Button>
    </form>
  );
}
