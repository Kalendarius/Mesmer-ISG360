import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDate, todayIstanbulISODate } from "@/lib/utils/date";
import { FINDING_STATUS_LABELS, OPEN_FINDING_STATUSES, type FindingRiskLevel, type FindingStatus } from "@/lib/utils/enums";
import { FINDING_RISK_LEVEL_VISUALS } from "@/lib/utils/risk";

interface PreviousOpenFindingsCardProps {
  organizationId: string;
  companyId: string;
  currentInspectionId: string;
}

/**
 * Bir sonraki denetimde, aynı işletmenin önceki denetimlerinden kalan açık
 * uygunsuzlukları hatırlatır (bkz. CLAUDE.md → Teslim 10). Yalnızca
 * görüntüler; herhangi bir otomatik kapama/taşıma yapmaz.
 */
export async function PreviousOpenFindingsCard({
  organizationId,
  companyId,
  currentInspectionId,
}: PreviousOpenFindingsCardProps) {
  const supabase = await createClient();
  const today = todayIstanbulISODate();

  const { data: findings } = await supabase
    .from("findings")
    .select("id, baslik, risk_seviyesi, durum, termin_tarihi, company_branches(sube_adi)")
    .eq("organization_id", organizationId)
    .eq("company_id", companyId)
    .neq("inspection_id", currentInspectionId)
    .in("durum", OPEN_FINDING_STATUSES)
    .is("deleted_at", null)
    .order("termin_tarihi", { ascending: true, nullsFirst: false })
    .limit(20);

  if (!findings || findings.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bu İşletmenin Geçmiş Açık Uygunsuzlukları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {findings.map((f) => {
          const riskVisual = FINDING_RISK_LEVEL_VISUALS[f.risk_seviyesi as FindingRiskLevel];
          const RiskIcon = riskVisual.icon;
          const isOverdue = f.termin_tarihi && f.termin_tarihi < today;
          return (
            <div
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-mesmer-border p-2 text-sm"
            >
              <div>
                <Link href={`/uygunsuzluklar/${f.id}`} className="font-medium text-mesmer-primary hover:underline">
                  {f.baslik}
                </Link>
                {f.company_branches?.sube_adi && (
                  <p className="text-xs text-mesmer-text-muted">{f.company_branches.sube_adi}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${riskVisual.textClassName}`}>
                  <RiskIcon className="size-3.5" />
                  {riskVisual.label}
                </span>
                {f.termin_tarihi && (
                  <span className={isOverdue ? "text-xs font-medium text-risk-high" : "text-xs text-mesmer-text-muted"}>
                    {formatDate(f.termin_tarihi)}
                    {isOverdue && " (Gecikti)"}
                  </span>
                )}
                <Badge variant="outline">{FINDING_STATUS_LABELS[f.durum as FindingStatus]}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
