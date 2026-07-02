import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/session";
import { formatDate, todayIstanbulISODate } from "@/lib/utils/date";
import {
  FINDING_STATUSES,
  FINDING_STATUS_LABELS,
  OPEN_FINDING_STATUSES,
  type FindingStatus,
  type FindingRiskLevel,
} from "@/lib/utils/enums";
import { FINDING_RISK_LEVEL_VISUALS } from "@/lib/utils/risk";
import { FindingFilters } from "./finding-filters";

interface PageProps {
  searchParams: Promise<{ q?: string; durum?: string; risk?: string; gecikmis?: string }>;
}

const FINDING_RISK_LEVELS_SET = ["low", "medium", "high", "critical"];

export default async function UygunsuzluklarPage({ searchParams }: PageProps) {
  const context = await requireUserContext();
  const { q, durum, risk, gecikmis } = await searchParams;
  const supabase = await createClient();
  const today = todayIstanbulISODate();
  const gecikmisOnly = gecikmis === "1";

  let query = supabase
    .from("findings")
    .select("id, baslik, risk_seviyesi, durum, termin_tarihi, created_at, companies(unvan), company_branches(sube_adi)")
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("baslik", `%${q}%`);
  if (durum && (FINDING_STATUSES as readonly string[]).includes(durum)) {
    query = query.eq("durum", durum as FindingStatus);
  }
  if (risk && FINDING_RISK_LEVELS_SET.includes(risk)) {
    query = query.eq("risk_seviyesi", risk as FindingRiskLevel);
  }
  if (gecikmisOnly) {
    query = query.lt("termin_tarihi", today).in("durum", OPEN_FINDING_STATUSES);
  }

  const { data: findings, error } = await query;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-mesmer-text">Uygunsuzluklar</h1>

      <FindingFilters />

      {error && <p className="text-sm text-risk-high">Uygunsuzluklar yüklenemedi: {error.message}</p>}

      {!error && findings && findings.length === 0 && (
        <p className="py-8 text-center text-sm text-mesmer-text-muted">Kayıt bulunamadı.</p>
      )}

      {!error && findings && findings.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-mesmer-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>İşletme / Şube</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Termin</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f) => {
                const riskVisual = FINDING_RISK_LEVEL_VISUALS[f.risk_seviyesi as FindingRiskLevel];
                const RiskIcon = riskVisual.icon;
                const isOverdue =
                  f.termin_tarihi && f.termin_tarihi < today && OPEN_FINDING_STATUSES.includes(f.durum);
                return (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Link href={`/uygunsuzluklar/${f.id}`} className="font-medium text-mesmer-primary hover:underline">
                        {f.baslik}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p>{f.companies?.unvan}</p>
                      {f.company_branches?.sube_adi && (
                        <p className="text-xs text-mesmer-text-muted">{f.company_branches.sube_adi}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${riskVisual.textClassName}`}>
                        <RiskIcon className="size-4" />
                        {riskVisual.label}
                      </span>
                    </TableCell>
                    <TableCell className={isOverdue ? "font-medium text-risk-high" : undefined}>
                      {f.termin_tarihi ? formatDate(f.termin_tarihi) : "—"}
                      {isOverdue && " (Gecikti)"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={f.durum === "closed_by_expert" ? "default" : f.durum === "cancelled" ? "secondary" : "outline"}>
                        {FINDING_STATUS_LABELS[f.durum as FindingStatus]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
