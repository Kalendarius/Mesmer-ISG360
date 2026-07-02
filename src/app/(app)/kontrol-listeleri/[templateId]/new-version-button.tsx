"use client";

import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNewVersionAction } from "./actions";

export function NewVersionButton({ templateId }: { templateId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await createNewVersionAction(templateId);
            if (result?.error) setError(result.error);
          })
        }
      >
        <Copy className="size-4" />
        {isPending ? "Oluşturuluyor..." : "Yeni Versiyon Başlat"}
      </Button>
      {error && <p className="text-xs text-risk-high">{error}</p>}
    </div>
  );
}
