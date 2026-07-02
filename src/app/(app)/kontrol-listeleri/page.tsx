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
import { MESMER_ORGANIZATION_ID } from "@/lib/constants";
import { INSPECTION_TYPE_LABELS, type InspectionType } from "@/lib/utils/enums";

interface PageProps {
  searchParams: Promise<{ durum?: string }>;
}

export default async function KontrolListeleriPage({ searchParams }: PageProps) {
  const context = await requireUserContext();
  const { durum } = await searchParams;
  const canWrite =
    hasWriteAccess(context.activeOrganization.role) &&
    context.activeOrganization.organizationId === MESMER_ORGANIZATION_ID;
  const supabase = await createClient();

  let query = supabase
    .from("checklist_templates")
    .select("id, ad, sektor, faaliyet_konusu, denetim_turu, is_active")
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .order("ad");

  if (durum === "pasif") query = query.eq("is_active", false);
  else if (!durum || durum === "aktif") query = query.eq("is_active", true);

  const { data: templates, error } = await query;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-mesmer-text">Kontrol Listesi Şablonları</h1>
        {canWrite && (
          <Button render={<Link href="/kontrol-listeleri/yeni" />} nativeButton={false}>
            <Plus className="size-4" />
            Yeni Şablon
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-risk-high">Şablonlar yüklenemedi: {error.message}</p>}

      {!error && templates && templates.length === 0 && (
        <p className="py-8 text-center text-sm text-mesmer-text-muted">Kayıt bulunamadı.</p>
      )}

      {!error && templates && templates.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-mesmer-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Şablon Adı</TableHead>
                <TableHead>Sektör</TableHead>
                <TableHead>Denetim Türü</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link
                      href={`/kontrol-listeleri/${t.id}`}
                      className="font-medium text-mesmer-primary hover:underline"
                    >
                      {t.ad}
                    </Link>
                  </TableCell>
                  <TableCell>{t.sektor ?? "—"}</TableCell>
                  <TableCell>
                    {t.denetim_turu ? INSPECTION_TYPE_LABELS[t.denetim_turu as InspectionType] : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.is_active ? "default" : "secondary"}>{t.is_active ? "Aktif" : "Pasif"}</Badge>
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
