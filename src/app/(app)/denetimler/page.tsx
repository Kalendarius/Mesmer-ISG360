import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/date";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
  INSPECTION_TYPE_LABELS,
  type InspectionStatus,
  type InspectionType,
} from "@/lib/utils/enums";

interface PageProps {
  searchParams: Promise<{ durum?: string }>;
}

export default async function DenetimlerPage({ searchParams }: PageProps) {
  const context = await requireUserContext();
  const { durum } = await searchParams;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  let query = supabase
    .from("inspections")
    .select("id, denetim_tarihi, denetim_turu, status, uzman_user_id, companies(unvan), company_branches(sube_adi)")
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .order("denetim_tarihi", { ascending: false });

  if (durum && (INSPECTION_STATUSES as readonly string[]).includes(durum)) {
    query = query.eq("status", durum as InspectionStatus);
  }

  const { data: inspections, error } = await query;

  const uzmanIds = [...new Set((inspections ?? []).map((i) => i.uzman_user_id))];
  const { data: uzmanlar } = uzmanIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", uzmanIds)
    : { data: [] };
  const uzmanMap = new Map((uzmanlar ?? []).map((u) => [u.id, u.full_name]));

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-mesmer-text">Denetimler</h1>
        {canWrite && (
          <Button render={<Link href="/denetimler/yeni" />} nativeButton={false}>
            <Plus className="size-4" />
            Yeni Denetim
          </Button>
        )}
      </div>

      <form className="flex gap-3" method="get">
        <select
          name="durum"
          defaultValue={durum ?? "hepsi"}
          className="h-8 w-48 rounded-md border border-mesmer-border bg-mesmer-surface px-2.5 text-sm outline-none"
        >
          <option value="hepsi">Tümü</option>
          <option value="draft">Taslak</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal Edildi</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filtrele
        </Button>
      </form>

      {error && <p className="text-sm text-risk-high">Denetimler yüklenemedi: {error.message}</p>}

      {!error && inspections && inspections.length === 0 && (
        <p className="py-8 text-center text-sm text-mesmer-text-muted">Kayıt bulunamadı.</p>
      )}

      {!error && inspections && inspections.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-mesmer-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İşletme / Şube</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Uzman</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <Link href={`/denetimler/${i.id}`} className="font-medium text-mesmer-primary hover:underline">
                      {i.companies?.unvan}
                    </Link>
                    {i.company_branches?.sube_adi && (
                      <p className="text-xs text-mesmer-text-muted">{i.company_branches.sube_adi}</p>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(i.denetim_tarihi)}</TableCell>
                  <TableCell>{INSPECTION_TYPE_LABELS[i.denetim_turu as InspectionType]}</TableCell>
                  <TableCell>{uzmanMap.get(i.uzman_user_id) ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={i.status === "completed" ? "default" : i.status === "cancelled" ? "secondary" : "outline"}>
                      {INSPECTION_STATUS_LABELS[i.status as InspectionStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
