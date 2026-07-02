"use client";

import { useState, useTransition } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOfflineSync } from "./offline-sync-provider";

export function OfflineSyncBanner() {
  const { isOnline, pendingCount, retrySync } = useOfflineSync();
  const [isPending, startTransition] = useTransition();
  const [dismissedWhilePending, setDismissedWhilePending] = useState(false);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-risk-medium bg-risk-medium-bg px-4 py-2 text-sm text-risk-medium">
      <div className="flex items-center gap-2">
        <WifiOff className="size-4 shrink-0" />
        <span>
          {!isOnline && "Çevrimdışısınız. "}
          {pendingCount > 0
            ? `${pendingCount} değişiklik cihazınızda bekliyor, bağlantı sağlanınca otomatik gönderilecek.`
            : "Değişiklikleriniz cihazınızda saklanacak."}
        </span>
      </div>
      {pendingCount > 0 && isOnline && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setDismissedWhilePending(true);
            startTransition(async () => {
              await retrySync();
              setDismissedWhilePending(false);
            });
          }}
        >
          <RefreshCw className={`size-4 ${isPending || dismissedWhilePending ? "animate-spin" : ""}`} />
          Şimdi Dene
        </Button>
      )}
    </div>
  );
}
