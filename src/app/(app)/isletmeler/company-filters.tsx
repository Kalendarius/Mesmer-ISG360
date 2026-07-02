"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HAZARD_CLASSES, HAZARD_CLASS_LABELS } from "@/lib/utils/enums";

export function CompanyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (q) params.set("q", q);
      else params.delete("q");
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "hepsi") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        placeholder="Ticari unvan, kısa ad veya vergi no ile ara..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("tehlike") ?? "hepsi"}
        onValueChange={(v) => updateParam("tehlike", v)}
        items={{ hepsi: "Tüm tehlike sınıfları", ...HAZARD_CLASS_LABELS }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Tehlike sınıfı" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hepsi">Tüm tehlike sınıfları</SelectItem>
          {HAZARD_CLASSES.map((h) => (
            <SelectItem key={h} value={h}>
              {HAZARD_CLASS_LABELS[h]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("durum") ?? "aktif"}
        onValueChange={(v) => updateParam("durum", v)}
        items={{ aktif: "Aktif", pasif: "Pasif", hepsi: "Tümü" }}
      >
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="aktif">Aktif</SelectItem>
          <SelectItem value="pasif">Pasif</SelectItem>
          <SelectItem value="hepsi">Tümü</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
