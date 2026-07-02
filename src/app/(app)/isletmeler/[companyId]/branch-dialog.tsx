"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { branchSchema, type BranchInput } from "@/lib/validation/company";
import { createBranchAction, updateBranchAction } from "./actions";

interface BranchDialogProps {
  companyId: string;
  branch?: BranchInput & { id: string };
}

export function BranchDialog({ companyId, branch }: BranchDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchInput>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch ?? { is_active: true },
  });

  const onSubmit = (data: BranchInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = branch
        ? await updateBranchAction(companyId, branch.id, data)
        : await createBranchAction(companyId, data);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setOpen(false);
        if (!branch) reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={branch ? "outline" : "default"} size="sm" />}>
        {branch ? "Düzenle" : (
          <>
            <Plus className="size-4" />
            Şube Ekle
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{branch ? "Şubeyi Düzenle" : "Yeni Şube"}</DialogTitle>
          <DialogDescription>Şube bilgilerini girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sube_adi">Şube Adı *</Label>
              <Input id="sube_adi" {...register("sube_adi")} />
              {errors.sube_adi && <p className="text-sm text-risk-high">{errors.sube_adi.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="adres">Adres</Label>
              <Input id="adres" {...register("adres")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="il">İl</Label>
              <Input id="il" {...register("il")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ilce">İlçe</Label>
              <Input id="ilce" {...register("ilce")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calisan_sayisi">Çalışan Sayısı</Label>
              <Input id="calisan_sayisi" type="number" min={0} {...register("calisan_sayisi")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yetkili_kisi">Yetkili Kişi</Label>
              <Input id="yetkili_kisi" {...register("yetkili_kisi")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yetkili_eposta">Yetkili E-posta</Label>
              <Input id="yetkili_eposta" type="email" {...register("yetkili_eposta")} />
              {errors.yetkili_eposta && (
                <p className="text-sm text-risk-high">{errors.yetkili_eposta.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yetkili_telefon">Yetkili Telefon</Label>
              <Input id="yetkili_telefon" type="tel" {...register("yetkili_telefon")} />
            </div>
          </div>
          {formError && <p className="text-sm text-risk-high">{formError}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Kaydediliyor..." : branch ? "Değişiklikleri Kaydet" : "Şubeyi Oluştur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
