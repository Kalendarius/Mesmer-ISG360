"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SendReportEmailButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/email/send-report/${reportId}`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "E-posta gönderilemedi.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="text-right">
      <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handleClick}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
        {isPending ? "Gönderiliyor..." : "E-posta Gönder"}
      </Button>
      {error && <p className="mt-1 text-xs text-risk-high">{error}</p>}
    </div>
  );
}
