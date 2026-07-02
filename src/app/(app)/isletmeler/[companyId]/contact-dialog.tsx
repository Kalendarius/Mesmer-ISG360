"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactSchema, type ContactInput } from "@/lib/validation/company";
import { createContactAction, updateContactAction } from "./actions";

interface BranchOption {
  id: string;
  sube_adi: string;
}

interface ContactDialogProps {
  companyId: string;
  branches: BranchOption[];
  contact?: ContactInput & { id: string };
}

export function ContactDialog({ companyId, branches, contact }: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact ?? { bildirim_alsin: true, ana_yetkili: false, is_active: true },
  });

  const onSubmit = (data: ContactInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = contact
        ? await updateContactAction(companyId, contact.id, data)
        : await createContactAction(companyId, data);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={contact ? "outline" : "default"} size="sm" />}>
        {contact ? "Düzenle" : (
          <>
            <Plus className="size-4" />
            Yetkili Ekle
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Yetkiliyi Düzenle" : "Yeni Yetkili"}</DialogTitle>
          <DialogDescription>İşletme veya şube yetkilisi bilgilerini girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ad_soyad">Ad Soyad *</Label>
              <Input id="ad_soyad" {...register("ad_soyad")} />
              {errors.ad_soyad && <p className="text-sm text-risk-high">{errors.ad_soyad.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gorev">Görev</Label>
              <Input id="gorev" {...register("gorev")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="branch_id">Şube</Label>
              <Controller
                control={control}
                name="branch_id"
                render={({ field }) => (
                  <Select value={field.value ?? "genel"} onValueChange={(v) => field.onChange(v === "genel" ? undefined : v)}>
                    <SelectTrigger id="branch_id" className="w-full">
                      <SelectValue placeholder="İşletme geneli" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genel">İşletme geneli</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.sube_adi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eposta">E-posta</Label>
              <Input id="eposta" type="email" {...register("eposta")} />
              {errors.eposta && <p className="text-sm text-risk-high">{errors.eposta.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefon">Telefon</Label>
              <Input id="telefon" type="tel" {...register("telefon")} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-mesmer-border px-3 py-2">
              <Label htmlFor="bildirim_alsin" className="font-normal">
                Bildirim alsın
              </Label>
              <Controller
                control={control}
                name="bildirim_alsin"
                render={({ field }) => (
                  <Switch id="bildirim_alsin" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-mesmer-border px-3 py-2">
              <Label htmlFor="ana_yetkili" className="font-normal">
                Ana yetkili
              </Label>
              <Controller
                control={control}
                name="ana_yetkili"
                render={({ field }) => (
                  <Switch id="ana_yetkili" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          </div>
          {formError && <p className="text-sm text-risk-high">{formError}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Kaydediliyor..." : contact ? "Değişiklikleri Kaydet" : "Yetkiliyi Oluştur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
