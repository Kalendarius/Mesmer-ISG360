"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { maddeSchema, type MaddeInput } from "@/lib/validation/regulation";
import { upsertMaddeAction } from "./actions";

interface MaddeDialogProps {
  regulationId: string;
  madde?: MaddeInput;
}

export function MaddeDialog({ regulationId, madde }: MaddeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaddeInput>({ resolver: zodResolver(maddeSchema), defaultValues: madde });

  const onSubmit = (data: MaddeInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await upsertMaddeAction(regulationId, data);
      if (result?.error) setFormError(result.error);
      else setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={madde ? "outline" : "default"} size="sm" />}>
        {madde ? (
          "Yeni Versiyon Ekle"
        ) : (
          <>
            <Plus className="size-4" />
            Madde Ekle
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{madde ? `Madde ${madde.madde_no} — Yeni Versiyon` : "Yeni Madde"}</DialogTitle>
          <DialogDescription>
            {madde
              ? "Değişiklik kaydedildiğinde eski versiyon korunur, yeni bir versiyon oluşturulur."
              : "Mevzuata yeni bir madde ekleyin."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="madde_no">Madde Numarası *</Label>
              <Input id="madde_no" disabled={!!madde} {...register("madde_no")} />
              {errors.madde_no && <p className="text-sm text-risk-high">{errors.madde_no.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="madde_basligi">Madde Başlığı</Label>
              <Input id="madde_basligi" {...register("madde_basligi")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="madde_metni">Madde Metni *</Label>
              <Textarea id="madde_metni" rows={6} {...register("madde_metni")} />
              {errors.madde_metni && <p className="text-sm text-risk-high">{errors.madde_metni.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kaynak_url">Kaynak Bağlantısı</Label>
              <Input id="kaynak_url" {...register("kaynak_url")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yururluk_tarihi">Yürürlük Tarihi</Label>
              <Input id="yururluk_tarihi" type="date" {...register("yururluk_tarihi")} />
            </div>
          </div>
          {formError && <p className="text-sm text-risk-high">{formError}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
