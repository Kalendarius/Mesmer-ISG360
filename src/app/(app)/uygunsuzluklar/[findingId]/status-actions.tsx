"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FINDING_STATUSES, FINDING_STATUS_LABELS, type FindingStatus } from "@/lib/utils/enums";
import { changeFindingStatusAction } from "./actions";

interface StatusActionsProps {
  findingId: string;
  currentStatus: FindingStatus;
}

export function StatusActions({ findingId, currentStatus }: StatusActionsProps) {
  const [yeniDurum, setYeniDurum] = useState<FindingStatus>(currentStatus);
  const [aciklama, setAciklama] = useState("");
  const [kapatmaNotu, setKapatmaNotu] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isClosing = yeniDurum === "closed_by_expert";
  const unchanged = yeniDurum === currentStatus;

  function handleSubmit() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await changeFindingStatusAction(findingId, {
        yeni_durum: yeniDurum,
        aciklama,
        kapatma_notu: kapatmaNotu,
      });
      if (result?.error) setError(result.error);
      else {
        setSuccess(true);
        setAciklama("");
        setKapatmaNotu("");
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-mesmer-border p-4">
      <div className="space-y-1.5">
        <Label htmlFor="yeni_durum">Durum Değiştir</Label>
        <Select value={yeniDurum} onValueChange={(v) => setYeniDurum(v as FindingStatus)} items={FINDING_STATUS_LABELS}>
          <SelectTrigger id="yeni_durum" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FINDING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {FINDING_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!unchanged && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="aciklama">Açıklama *</Label>
            <Textarea
              id="aciklama"
              rows={2}
              placeholder="Bu durum değişikliğinin nedenini açıklayın"
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
            />
          </div>
          {isClosing && (
            <div className="space-y-1.5">
              <Label htmlFor="kapatma_notu">Kapatma Notu *</Label>
              <Textarea
                id="kapatma_notu"
                rows={2}
                placeholder="Uygunsuzluğun nasıl giderildiğini açıklayın"
                value={kapatmaNotu}
                onChange={(e) => setKapatmaNotu(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-risk-high">{error}</p>}
          {success && <p className="text-sm text-risk-compliant">Durum güncellendi.</p>}
          <Button type="button" onClick={handleSubmit} disabled={isPending || !aciklama || (isClosing && !kapatmaNotu)}>
            {isPending ? "Kaydediliyor..." : "Durumu Güncelle"}
          </Button>
        </>
      )}
    </div>
  );
}
