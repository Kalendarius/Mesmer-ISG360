"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeInspectionAction } from "./actions";

export function CompleteButton({ inspectionId }: { inspectionId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await completeInspectionAction(inspectionId);
            if (result?.error) setError(result.error);
          })
        }
      >
        <CheckCircle2 className="size-4" />
        {isPending ? "Tamamlanıyor..." : "Denetimi Tamamla"}
      </Button>
      {error && <p className="text-xs text-risk-high">{error}</p>}
    </div>
  );
}
