"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateReportButton({ inspectionId }: { inspectionId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/reports/${inspectionId}`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Rapor oluşturulamadı.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleClick}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
        {isPending ? "Oluşturuluyor..." : "Yeni Rapor Oluştur"}
      </Button>
      {error && <p className="text-sm text-risk-high">{error}</p>}
    </div>
  );
}
