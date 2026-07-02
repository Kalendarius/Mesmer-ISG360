import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/date";
import { ActiveToggleButton } from "@/components/active-toggle-button";
import { setRegulationActiveAction } from "../actions";
import { MaddeDialog } from "./madde-dialog";

interface PageProps {
  params: Promise<{ regulationId: string }>;
}

export default async function MevzuatDetayPage({ params }: PageProps) {
  const context = await requireUserContext();
  const { regulationId } = await params;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  const { data: regulation } = await supabase
    .from("regulations")
    .select("*")
    .eq("id", regulationId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!regulation) notFound();

  const { data: maddeler } = await supabase
    .from("regulation_versions")
    .select("*")
    .eq("regulation_id", regulationId)
    .eq("is_current", true)
    .order("madde_no");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{regulation.mevzuat_adi}</CardTitle>
            {regulation.mevzuat_turu && <p className="text-sm text-mesmer-text-muted">{regulation.mevzuat_turu}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={regulation.is_active ? "default" : "secondary"}>
              {regulation.is_active ? "Aktif" : "Pasif"}
            </Badge>
            {canWrite && (
              <>
                <Button
                  render={<Link href={`/mevzuat/${regulation.id}/duzenle`} />}
                  nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="size-4" />
                  Düzenle
                </Button>
                <ActiveToggleButton
                  isActive={regulation.is_active}
                  action={setRegulationActiveAction.bind(null, regulation.id, !regulation.is_active)}
                />
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Maddeler</CardTitle>
          {canWrite && <MaddeDialog regulationId={regulation.id} />}
        </CardHeader>
        <CardContent>
          {!maddeler || maddeler.length === 0 ? (
            <p className="text-sm text-mesmer-text-muted">Henüz madde eklenmemiş.</p>
          ) : (
            <div className="space-y-4">
              {maddeler.map((m) => (
                <div key={m.id} className="rounded-md border border-mesmer-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-mesmer-text">
                        Madde {m.madde_no}
                        {m.madde_basligi && ` — ${m.madde_basligi}`}
                      </p>
                      <p className="text-xs text-mesmer-text-muted">
                        Versiyon {m.version_no}
                        {m.yururluk_tarihi && ` · Yürürlük: ${formatDate(m.yururluk_tarihi)}`}
                        {m.kaynak_url && (
                          <>
                            {" · "}
                            <a href={m.kaynak_url} target="_blank" rel="noreferrer" className="text-mesmer-primary hover:underline">
                              Kaynak
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                    {canWrite && (
                      <MaddeDialog
                        regulationId={regulation.id}
                        madde={{
                          madde_no: m.madde_no ?? "",
                          madde_basligi: m.madde_basligi ?? "",
                          madde_metni: m.madde_metni,
                          kaynak_url: m.kaynak_url ?? "",
                          yururluk_tarihi: m.yururluk_tarihi ?? "",
                        }}
                      />
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-mesmer-text">{m.madde_metni}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
