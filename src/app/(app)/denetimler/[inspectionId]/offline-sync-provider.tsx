"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { queueMutation, getQueuedMutations, removeMutation, type QueuedMutation } from "@/lib/offline/db";
import { updateResponseAction, markNonCompliantAction } from "./actions";
import type { ResponseUpdateInput, FindingQuickInput } from "@/lib/validation/inspection";

interface OfflineActionResult {
  error?: string;
  queued?: boolean;
}

interface OfflineSyncContextValue {
  isOnline: boolean;
  pendingCount: number;
  pendingResponseIds: Set<string>;
  updateResponse: (responseId: string, input: ResponseUpdateInput) => Promise<OfflineActionResult>;
  markNonCompliant: (responseId: string, input: FindingQuickInput) => Promise<OfflineActionResult>;
  retrySync: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export function useOfflineSync(): OfflineSyncContextValue {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) throw new Error("useOfflineSync, OfflineSyncProvider içinde kullanılmalı.");
  return ctx;
}

/** Ağ hatası mı (çevrimdışı) yoksa sunucudan dönen gerçek bir hata mı ayırt eder. */
function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

export function OfflineSyncProvider({
  inspectionId,
  children,
}: {
  inspectionId: string;
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [queue, setQueue] = useState<QueuedMutation[]>([]);

  const refreshQueue = useCallback(async () => {
    const items = await getQueuedMutations(inspectionId);
    setQueue(items);
    return items;
  }, [inspectionId]);

  const flushQueue = useCallback(async () => {
    let items = await refreshQueue();
    for (const item of items) {
      if (!navigator.onLine) break;
      try {
        const result =
          item.type === "update_response"
            ? await updateResponseAction(item.inspectionId, item.responseId, item.payload)
            : await markNonCompliantAction(item.inspectionId, item.responseId, item.payload);
        if (result?.error) break; // gerçek bir hata — daha fazla denemenin anlamı yok, kullanıcı manuel müdahale etmeli
        await removeMutation(item.id);
      } catch (err) {
        if (isNetworkError(err)) break; // hâlâ çevrimdışı, sıradaki bağlantı denemesinde tekrar denenecek
        break;
      }
    }
    items = await refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      flushQueue();
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // Sayfa yüklenirken kuyruğu okur ve çevrimiçiyse senkronize etmeyi
    // dener; setTimeout ile effect'in senkron gövdesinden ayrıştırılır.
    const timer = setTimeout(() => flushQueue(), 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateResponse = useCallback(
    async (responseId: string, input: ResponseUpdateInput): Promise<OfflineActionResult> => {
      if (!navigator.onLine) {
        await queueMutation({
          id: crypto.randomUUID(),
          inspectionId,
          type: "update_response",
          responseId,
          payload: input,
          createdAt: new Date().toISOString(),
        });
        await refreshQueue();
        return { queued: true };
      }
      try {
        return await updateResponseAction(inspectionId, responseId, input);
      } catch (err) {
        if (!isNetworkError(err)) throw err;
        await queueMutation({
          id: crypto.randomUUID(),
          inspectionId,
          type: "update_response",
          responseId,
          payload: input,
          createdAt: new Date().toISOString(),
        });
        await refreshQueue();
        setIsOnline(false);
        return { queued: true };
      }
    },
    [inspectionId, refreshQueue],
  );

  const markNonCompliant = useCallback(
    async (responseId: string, input: FindingQuickInput): Promise<OfflineActionResult> => {
      if (!navigator.onLine) {
        await queueMutation({
          id: crypto.randomUUID(),
          inspectionId,
          type: "mark_non_compliant",
          responseId,
          payload: input,
          createdAt: new Date().toISOString(),
        });
        await refreshQueue();
        return { queued: true };
      }
      try {
        return await markNonCompliantAction(inspectionId, responseId, input);
      } catch (err) {
        if (!isNetworkError(err)) throw err;
        await queueMutation({
          id: crypto.randomUUID(),
          inspectionId,
          type: "mark_non_compliant",
          responseId,
          payload: input,
          createdAt: new Date().toISOString(),
        });
        await refreshQueue();
        setIsOnline(false);
        return { queued: true };
      }
    },
    [inspectionId, refreshQueue],
  );

  const pendingResponseIds = useMemo(() => new Set(queue.map((q) => q.responseId)), [queue]);

  const value: OfflineSyncContextValue = {
    isOnline,
    pendingCount: queue.length,
    pendingResponseIds,
    updateResponse,
    markNonCompliant,
    retrySync: flushQueue,
  };

  return <OfflineSyncContext.Provider value={value}>{children}</OfflineSyncContext.Provider>;
}
