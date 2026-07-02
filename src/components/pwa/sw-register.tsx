"use client";

import { useEffect } from "react";

/** Uygulama kabuğu için service worker'ı kaydeder (bkz. public/sw.js). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Kayıt başarısız olsa bile uygulama normal (çevrimiçi) çalışmaya devam eder.
    });
  }, []);

  return null;
}
