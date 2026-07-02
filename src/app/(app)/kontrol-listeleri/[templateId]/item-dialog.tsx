"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { itemSchema, type ItemInput } from "@/lib/validation/checklist";
import { FINDING_RISK_LEVELS, FINDING_RISK_LEVEL_LABELS } from "@/lib/utils/enums";
import { createItemAction, updateItemAction } from "./actions";

interface CategoryOption {
  id: string;
  ad: string;
}

interface RegulationOption {
  id: string;
  label: string;
}

interface ItemDialogProps {
  templateId: string;
  versionId: string;
  categories: CategoryOption[];
  regulationOptions: RegulationOption[];
  nextSiraNo: number;
  item?: ItemInput & { id: string };
  defaultCategoryId?: string;
}

export function ItemDialog({
  templateId,
  versionId,
  categories,
  regulationOptions,
  nextSiraNo,
  item,
  defaultCategoryId,
}: ItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: item ?? {
      checklist_category_id: defaultCategoryId ?? "",
      varsayilan_risk_seviyesi: "medium",
      zorunlu: true,
      fotograf_gerekli: false,
      is_certification_opportunity: false,
      is_active: true,
      sira_no: String(nextSiraNo),
    },
  });

  const onSubmit = (data: ItemInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = item
        ? await updateItemAction(templateId, item.id, data, nextSiraNo)
        : await createItemAction(templateId, versionId, data, nextSiraNo);
      if (result?.error) setFormError(result.error);
      else setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={item ? "outline" : "default"} size="sm" />}>
        {item ? "Düzenle" : (
          <>
            <Plus className="size-4" />
            Madde Ekle
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? "Kontrol Maddesini Düzenle" : "Yeni Kontrol Maddesi"}</DialogTitle>
          <DialogDescription>Denetim sırasında sorulacak kontrol maddesini tanımlayın.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="soru">Soru *</Label>
            <Textarea id="soru" rows={2} {...register("soru")} />
            {errors.soru && <p className="text-sm text-risk-high">{errors.soru.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aciklama">Açıklama</Label>
            <Textarea id="aciklama" rows={2} {...register("aciklama")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="checklist_category_id">Kategori *</Label>
              <Controller
                control={control}
                name="checklist_category_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    items={Object.fromEntries(categories.map((c) => [c.id, c.ad]))}
                  >
                    <SelectTrigger id="checklist_category_id" className="w-full">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.ad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.checklist_category_id && (
                <p className="text-sm text-risk-high">{errors.checklist_category_id.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="varsayilan_risk_seviyesi">Varsayılan Risk Seviyesi *</Label>
              <Controller
                control={control}
                name="varsayilan_risk_seviyesi"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} items={FINDING_RISK_LEVEL_LABELS}>
                    <SelectTrigger id="varsayilan_risk_seviyesi" className="w-full">
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="regulation_version_id">İlgili Mevzuat Maddesi</Label>
              <Controller
                control={control}
                name="regulation_version_id"
                render={({ field }) => (
                  <Select
                    value={field.value || "yok"}
                    onValueChange={(v) => field.onChange(v === "yok" ? "" : v)}
                    items={{ yok: "Yok", ...Object.fromEntries(regulationOptions.map((r) => [r.id, r.label])) }}
                  >
                    <SelectTrigger id="regulation_version_id" className="w-full">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yok">Yok</SelectItem>
                      {regulationOptions.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="standart_uygunsuzluk_aciklamasi">Standart Uygunsuzluk Açıklaması</Label>
              <Textarea id="standart_uygunsuzluk_aciklamasi" rows={2} {...register("standart_uygunsuzluk_aciklamasi")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="onerilen_duzeltici_faaliyet">Önerilen Düzeltici Faaliyet</Label>
              <Textarea id="onerilen_duzeltici_faaliyet" rows={2} {...register("onerilen_duzeltici_faaliyet")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sira_no">Sıra Numarası</Label>
              <Input id="sira_no" type="number" {...register("sira_no")} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border border-mesmer-border px-3 py-2">
              <Label htmlFor="zorunlu" className="font-normal">
                Zorunlu
              </Label>
              <Controller
                control={control}
                name="zorunlu"
                render={({ field }) => <Switch id="zorunlu" checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-mesmer-border px-3 py-2">
              <Label htmlFor="fotograf_gerekli" className="font-normal">
                Fotoğraf Gerekli
              </Label>
              <Controller
                control={control}
                name="fotograf_gerekli"
                render={({ field }) => (
                  <Switch id="fotograf_gerekli" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-mesmer-border px-3 py-2">
              <Label htmlFor="is_certification_opportunity" className="font-normal">
                MYK Fırsatı
              </Label>
              <Controller
                control={control}
                name="is_certification_opportunity"
                render={({ field }) => (
                  <Switch
                    id="is_certification_opportunity"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
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
