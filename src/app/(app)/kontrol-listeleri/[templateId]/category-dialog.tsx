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
import { categorySchema, type CategoryInput } from "@/lib/validation/checklist";
import { createCategoryAction, updateCategoryAction } from "./actions";

interface CategoryDialogProps {
  templateId: string;
  versionId: string;
  nextSiraNo: number;
  category?: CategoryInput & { id: string };
}

export function CategoryDialog({ templateId, versionId, nextSiraNo, category }: CategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ?? { sira_no: String(nextSiraNo) },
  });

  const onSubmit = (data: CategoryInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(templateId, category.id, data, nextSiraNo)
        : await createCategoryAction(templateId, versionId, data, nextSiraNo);
      if (result?.error) setFormError(result.error);
      else setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={category ? "outline" : "default"} size="sm" />}>
        {category ? "Düzenle" : (
          <>
            <Plus className="size-4" />
            Kategori Ekle
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Kategoriyi Düzenle" : "Yeni Kategori"}</DialogTitle>
          <DialogDescription>Örn. Genel İSG, Yangın Güvenliği, Kişisel Koruyucu Donanım.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="ad">Kategori Adı *</Label>
            <Input id="ad" {...register("ad")} />
            {errors.ad && <p className="text-sm text-risk-high">{errors.ad.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sira_no">Sıra Numarası</Label>
            <Input id="sira_no" type="number" {...register("sira_no")} />
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
