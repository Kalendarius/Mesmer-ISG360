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
import { HAZARD_CLASSES, HAZARD_CLASS_LABELS, type HazardClass } from "@/lib/utils/enums";
import { CompanyFilters } from "./company-filters";

interface IsletmelerPageProps {
  searchParams: Promise<{ q?: string; tehlike?: string; durum?: string }>;
}

export default async function IsletmelerPage({ searchParams }: IsletmelerPageProps) {
  const context = await requireUserContext();
  const { q, tehlike, durum } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("companies")
    .select("id, unvan, kisa_ad, vergi_no, tehlike_sinifi, calisan_sayisi, is_active")
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .order("unvan");

  if (q) {
    query = query.or(`unvan.ilike.%${q}%,kisa_ad.ilike.%${q}%,vergi_no.ilike.%${q}%`);
  }
  if (tehlike && (HAZARD_CLASSES as readonly string[]).includes(tehlike)) {
    query = query.eq("tehlike_sinifi", tehlike as HazardClass);
  }
  if (durum === "aktif") query = query.eq("is_active", true);
  else if (durum === "pasif") query = query.eq("is_active", false);
  else if (!durum) query = query.eq("is_active", true);

  const { data: companies, error } = await query;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-mesmer-text">İşletmeler</h1>
        {hasWriteAccess(context.activeOrganization.role) && (
          <Button render={<Link href="/isletmeler/yeni" />} nativeButton={false}>
            <Plus className="size-4" />
            Yeni İşletme
          </Button>
        )}
      </div>

      <CompanyFilters />

      {error && <p className="text-sm text-risk-high">İşletmeler yüklenemedi: {error.message}</p>}

      {!error && companies && companies.length === 0 && (
        <p className="py-8 text-center text-sm text-mesmer-text-muted">
          Kayıt bulunamadı. Filtreleri değiştirmeyi deneyin{" "}
          {hasWriteAccess(context.activeOrganization.role) && "veya yeni bir işletme ekleyin."}
        </p>
      )}

      {!error && companies && companies.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-mesmer-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticari Unvan</TableHead>
                <TableHead>Vergi No</TableHead>
                <TableHead>Tehlike Sınıfı</TableHead>
                <TableHead>Çalışan Sayısı</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/isletmeler/${c.id}`} className="font-medium text-mesmer-primary hover:underline">
                      {c.unvan}
                    </Link>
                    {c.kisa_ad && <p className="text-xs text-mesmer-text-muted">{c.kisa_ad}</p>}
                  </TableCell>
                  <TableCell>{c.vergi_no ?? "—"}</TableCell>
                  <TableCell>
                    {c.tehlike_sinifi ? HAZARD_CLASS_LABELS[c.tehlike_sinifi as HazardClass] : "—"}
                  </TableCell>
                  <TableCell>{c.calisan_sayisi ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"}>
                      {c.is_active ? "Aktif" : "Pasif"}
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
