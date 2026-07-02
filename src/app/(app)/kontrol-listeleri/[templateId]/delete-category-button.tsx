"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCategoryAction } from "./actions";

interface DeleteCategoryButtonProps {
  templateId: string;
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryButton({ templateId, categoryId, categoryName }: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button type="button" variant="outline" size="icon-sm" />}>
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{categoryName}&quot; kategorisini silmek istediğinize emin misiniz? Bu kategoride kontrol
            maddesi varsa silme işlemi engellenir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-risk-high">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await deleteCategoryAction(templateId, categoryId);
                if (result?.error) setError(result.error);
                else setOpen(false);
              });
            }}
          >
            {isPending ? "Siliniyor..." : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
