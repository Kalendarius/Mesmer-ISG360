"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Camera, CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RESPONSE_RESULTS, type FindingRiskLevel, type ResponseResult } from "@/lib/utils/enums";
import { RESPONSE_RESULT_VISUALS } from "@/lib/utils/risk";
import { FindingQuickDialog } from "./finding-quick-dialog";
import { useOfflineSync } from "./offline-sync-provider";

interface ChecklistItemMeta {
  zorunlu: boolean;
  fotograf_gerekli: boolean;
  varsayilan_risk_seviyesi: FindingRiskLevel;
  standart_uygunsuzluk_aciklamasi: string | null;
}

interface ResponseItemProps {
  responseId: string;
  siraNo: number;
  soru: string;
  aciklama: string | null;
  regulationReference: string | null;
  sonuc: ResponseResult | null;
  notMetni: string | null;
  checklistItem: ChecklistItemMeta;
  existingFinding: { id: string; baslik: string } | null;
  canWrite: boolean;
}

export function ResponseItem({
  responseId,
  siraNo,
  soru,
  aciklama,
  regulationReference,
  sonuc,
  notMetni,
  checklistItem,
  existingFinding,
  canWrite,
}: ResponseItemProps) {
  const { updateResponse, markNonCompliant, pendingResponseIds } = useOfflineSync();
  const [isPending, startTransition] = useTransition();
  const [localSonuc, setLocalSonuc] = useState(sonuc);
  const [localHasFinding, setLocalHasFinding] = useState(!!existingFinding);
  const [note, setNote] = useState(notMetni ?? "");
  const [findingDialogOpen, setFindingDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPendingSync = pendingResponseIds.has(responseId);

  function handleResultClick(result: ResponseResult) {
    if (!canWrite) return;
    if (result === "non_compliant" && !localHasFinding) {
      setFindingDialogOpen(true);
      return;
    }
    const previous = localSonuc;
    setLocalSonuc(result);
    setError(null);
    startTransition(async () => {
      const res = await updateResponse(responseId, { sonuc: result, not_metni: note });
      if (res?.error) {
        setError(res.error);
        setLocalSonuc(previous);
      }
    });
  }

  function handleNoteBlur() {
    if (!canWrite) return;
    startTransition(async () => {
      await updateResponse(responseId, { sonuc: localSonuc, not_metni: note });
    });
  }

  return (
    <div className="rounded-md border border-mesmer-border p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-mesmer-text">
            {siraNo}. {soru}
          </p>
          {aciklama && <p className="mt-0.5 text-xs text-mesmer-text-muted">{aciklama}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-mesmer-text-muted">
            {checklistItem.zorunlu && <Badge variant="outline">Zorunlu</Badge>}
            {checklistItem.fotograf_gerekli && (
              <Badge variant="outline">
                <Camera className="size-3" />
                Fotoğraf Gerekli
              </Badge>
            )}
            {regulationReference && <span>{regulationReference}</span>}
            {isPendingSync && (
              <Badge variant="outline" className="text-risk-medium">
                <CloudUpload className="size-3" />
                Senkronize bekleniyor
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RESPONSE_RESULTS.map((result) => {
          const visual = RESPONSE_RESULT_VISUALS[result];
          const Icon = visual.icon;
          const active = localSonuc === result;
          return (
            <button
              key={result}
              type="button"
              disabled={!canWrite || isPending}
              onClick={() => handleResultClick(result)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs font-medium transition-colors disabled:opacity-50",
                active
                  ? `${visual.bgClassName} ${visual.textClassName} border-current`
                  : "border-mesmer-border text-mesmer-text-muted hover:bg-mesmer-primary-light",
              )}
            >
              <Icon className="size-5" />
              {visual.label}
            </button>
          );
        })}
      </div>

      {existingFinding ? (
        <p className="mt-2 text-xs text-risk-high">
          Uygunsuzluk:{" "}
          <Link href={`/uygunsuzluklar/${existingFinding.id}`} className="underline">
            {existingFinding.baslik}
          </Link>
        </p>
      ) : (
        localHasFinding && (
          <p className="mt-2 text-xs text-risk-high">Uygunsuzluk kaydedildi (senkronize edilmeyi bekliyor).</p>
        )
      )}

      {error && <p className="mt-2 text-xs text-risk-high">{error}</p>}

      <div className="mt-3">
        <Textarea
          placeholder="Not ekleyin (opsiyonel)"
          rows={2}
          value={note}
          disabled={!canWrite}
          onChange={(e) => setNote(e.target.value)}
          onBlur={handleNoteBlur}
        />
      </div>

      <FindingQuickDialog
        open={findingDialogOpen}
        onOpenChange={setFindingDialogOpen}
        responseId={responseId}
        onSubmit={markNonCompliant}
        defaultValues={{
          baslik: checklistItem.standart_uygunsuzluk_aciklamasi || soru,
          risk_seviyesi: checklistItem.varsayilan_risk_seviyesi,
        }}
        onSuccess={() => {
          setError(null);
          setLocalSonuc("non_compliant");
          setLocalHasFinding(true);
        }}
      />
    </div>
  );
}
