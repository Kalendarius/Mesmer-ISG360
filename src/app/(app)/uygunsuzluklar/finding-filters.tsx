"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FINDING_STATUSES, FINDING_STATUS_LABELS, FINDING_RISK_LEVELS, FINDING_RISK_LEVEL_LABELS } from "@/lib/utils/enums";

export function FindingFilters() {
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
        placeholder="Başlık veya işletme ile ara..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("durum") ?? "hepsi"}
        onValueChange={(v) => updateParam("durum", v)}
        items={{ hepsi: "Tüm durumlar", ...FINDING_STATUS_LABELS }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hepsi">Tüm durumlar</SelectItem>
          {FINDING_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {FINDING_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("risk") ?? "hepsi"}
        onValueChange={(v) => updateParam("risk", v)}
        items={{ hepsi: "Tüm risk seviyeleri", ...FINDING_RISK_LEVEL_LABELS }}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Risk seviyesi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hepsi">Tüm risk seviyeleri</SelectItem>
          {FINDING_RISK_LEVELS.map((r) => (
            <SelectItem key={r} value={r}>
              {FINDING_RISK_LEVEL_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2 rounded-md border border-mesmer-border px-3 py-1.5">
        <Switch
          id="gecikmis"
          checked={searchParams.get("gecikmis") === "1"}
          onCheckedChange={(checked) => updateParam("gecikmis", checked ? "1" : null)}
        />
        <Label htmlFor="gecikmis" className="font-normal whitespace-nowrap">
          Yalnızca gecikmiş
        </Label>
      </div>
    </div>
  );
}
