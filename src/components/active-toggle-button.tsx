"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface ActiveToggleButtonProps {
  isActive: boolean;
  action: () => Promise<{ error?: string } | void>;
}

export function ActiveToggleButton({ isActive, action }: ActiveToggleButtonProps) {
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
            const result = await action();
            if (result?.error) setError(result.error);
          })
        }
      >
        {isPending ? "İşleniyor..." : isActive ? "Pasife Al" : "Aktif Et"}
      </Button>
      {error && <p className="text-xs text-risk-high">{error}</p>}
    </div>
  );
}
