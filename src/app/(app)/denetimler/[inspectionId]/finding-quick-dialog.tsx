"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { findingQuickSchema, type FindingQuickInput } from "@/lib/validation/inspection";
import { FINDING_RISK_LEVELS, FINDING_RISK_LEVEL_LABELS, type FindingRiskLevel } from "@/lib/utils/enums";

interface FindingQuickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseId: string;
  onSubmit: (responseId: string, input: FindingQuickInput) => Promise<{ error?: string; queued?: boolean }>;
  defaultValues: {
    baslik: string;
    aciklama?: string;
    risk_seviyesi: FindingRiskLevel;
  };
  onSuccess: () => void;
}

export function FindingQuickDialog({
  open,
  onOpenChange,
  responseId,
  onSubmit: submitFinding,
  defaultValues,
  onSuccess,
}: FindingQuickDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FindingQuickInput>({
    resolver: zodResolver(findingQuickSchema),
    defaultValues,
  });

  const onSubmit = (data: FindingQuickInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await submitFinding(responseId, data);
      if (result?.error) setFormError(result.error);
      else {
        onOpenChange(false);
        onSuccess();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Uygunsuzluk Kaydı</DialogTitle>
          <DialogDescription>
            Bu maddeyi &quot;Uygun Değil&quot; işaretlemek bir uygunsuzluk kaydı oluşturur.
          </DialogDescription>
        </DialogHeader>
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
              <Label htmlFor="sorumlu_kisi_adi">Sorumlu Kişi</Label>
              <Input id="sorumlu_kisi_adi" {...register("sorumlu_kisi_adi")} />
            </div>
          </div>
          {formError && <p className="text-sm text-risk-high">{formError}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Kaydediliyor..." : "Uygunsuzluğu Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
