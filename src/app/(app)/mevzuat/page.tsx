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

interface MevzuatPageProps {
  searchParams: Promise<{ q?: string; durum?: string }>;
}

export default async function MevzuatPage({ searchParams }: MevzuatPageProps) {
  const context = await requireUserContext();
  const { q, durum } = await searchParams;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  let query = supabase
    .from("regulations")
    .select("id, mevzuat_adi, mevzuat_turu, is_active, regulation_versions(count)")
    .eq("organization_id", context.activeOrganization.organizationId)
    .eq("regulation_versions.is_current", true)
    .is("deleted_at", null)
    .order("mevzuat_adi");

  if (q) query = query.ilike("mevzuat_adi", `%${q}%`);
  if (durum === "pasif") query = query.eq("is_active", false);
  else if (!durum || durum === "aktif") query = query.eq("is_active", true);

  const { data: regulations, error } = await query;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-mesmer-text">Mevzuat</h1>
        {canWrite && (
          <Button render={<Link href="/mevzuat/yeni" />} nativeButton={false}>
            <Plus className="size-4" />
            Yeni Mevzuat
          </Button>
        )}
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Mevzuat adı ile ara..."
          className="h-8 w-full max-w-xs rounded-md border border-mesmer-border bg-mesmer-surface px-2.5 text-sm outline-none focus-visible:border-mesmer-primary"
        />
        <select
          name="durum"
          defaultValue={durum ?? "aktif"}
          className="h-8 w-40 rounded-md border border-mesmer-border bg-mesmer-surface px-2.5 text-sm outline-none"
        >
          <option value="aktif">Aktif</option>
          <option value="pasif">Pasif</option>
          <option value="hepsi">Tümü</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filtrele
        </Button>
      </form>

      {error && <p className="text-sm text-risk-high">Mevzuat listesi yüklenemedi: {error.message}</p>}

      {!error && regulations && regulations.length === 0 && (
        <p className="py-8 text-center text-sm text-mesmer-text-muted">Kayıt bulunamadı.</p>
      )}

      {!error && regulations && regulations.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-mesmer-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mevzuat Adı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Madde Sayısı</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regulations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/mevzuat/${r.id}`} className="font-medium text-mesmer-primary hover:underline">
                      {r.mevzuat_adi}
                    </Link>
                  </TableCell>
                  <TableCell>{r.mevzuat_turu ?? "—"}</TableCell>
                  <TableCell>{r.regulation_versions[0]?.count ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Aktif" : "Pasif"}</Badge>
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
