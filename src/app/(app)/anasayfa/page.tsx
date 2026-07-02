import Link from "next/link";
import { Building2, ClipboardCheck, FileClock, AlertTriangle, AlarmClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { formatDate, todayIstanbulISODate } from "@/lib/utils/date";
import { FINDING_STATUS_LABELS, OPEN_FINDING_STATUSES, type FindingRiskLevel, type FindingStatus } from "@/lib/utils/enums";
import { FINDING_RISK_LEVEL_VISUALS } from "@/lib/utils/risk";

export default async function AnasayfaPage() {
  const context = await requireUserContext();
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const organizationId = context.activeOrganization.organizationId;
  const supabase = await createClient();
  const today = todayIstanbulISODate();

  const [
    { count: activeCompanyCount },
    { count: completedInspectionCount },
    { count: draftInspectionCount },
    { count: openFindingCount },
    { count: overdueFindingCount },
    { data: trackedFindings },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("inspections")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "completed")
      .is("deleted_at", null),
    supabase
      .from("inspections")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "draft")
      .is("deleted_at", null),
    supabase
      .from("findings")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("durum", OPEN_FINDING_STATUSES)
      .is("deleted_at", null),
    supabase
      .from("findings")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("durum", OPEN_FINDING_STATUSES)
      .lt("termin_tarihi", today)
      .is("deleted_at", null),
    supabase
      .from("findings")
      .select("id, baslik, risk_seviyesi, durum, termin_tarihi, companies(unvan), company_branches(sube_adi)")
      .eq("organization_id", organizationId)
      .in("durum", OPEN_FINDING_STATUSES)
      .is("deleted_at", null)
      .order("termin_tarihi", { ascending: true, nullsFirst: false })
      .limit(10),
  ]);

  const cards = [
    { label: "Aktif İşletme", value: activeCompanyCount ?? 0, icon: Building2, href: "/isletmeler" },
    { label: "Tamamlanan Denetim", value: completedInspectionCount ?? 0, icon: ClipboardCheck, href: "/denetimler" },
    { label: "Taslak Denetim", value: draftInspectionCount ?? 0, icon: FileClock, href: "/denetimler?durum=draft" },
    { label: "Açık Uygunsuzluk", value: openFindingCount ?? 0, icon: AlertTriangle, href: "/uygunsuzluklar" },
    { label: "Gecikmiş Uygunsuzluk", value: overdueFindingCount ?? 0, icon: AlarmClock, href: "/uygunsuzluklar?gecikmis=1" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-mesmer-text">Hoş geldiniz, {context.fullName ?? context.email}</h1>
          <p className="mt-1 text-sm text-mesmer-text-muted">
            {context.activeOrganization.organizationDisplayName} kuruluşu için oturum açtınız.
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Button render={<Link href="/isletmeler/yeni" />} nativeButton={false} variant="outline" size="sm">
              <Plus className="size-4" />
              Yeni İşletme
            </Button>
            <Button render={<Link href="/denetimler/yeni" />} nativeButton={false} size="sm">
              <Plus className="size-4" />
              Yeni Denetim
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="transition-colors hover:bg-mesmer-primary-light">
                <CardContent className="flex flex-col gap-2 px-4 py-4">
                  <Icon className="size-5 text-mesmer-primary" />
                  <p className="text-2xl font-semibold text-mesmer-text">{card.value}</p>
                  <p className="text-xs text-mesmer-text-muted">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Takip Gerektiren Uygunsuzluklar</CardTitle>
        </CardHeader>
        <CardContent>
          {!trackedFindings || trackedFindings.length === 0 ? (
            <p className="text-sm text-mesmer-text-muted">Açık uygunsuzluk bulunmuyor.</p>
          ) : (
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
                  {trackedFindings.map((f) => {
                    const riskVisual = FINDING_RISK_LEVEL_VISUALS[f.risk_seviyesi as FindingRiskLevel];
                    const RiskIcon = riskVisual.icon;
                    const isOverdue = f.termin_tarihi && f.termin_tarihi < today;
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
                          <Badge variant="outline">{FINDING_STATUS_LABELS[f.durum as FindingStatus]}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
