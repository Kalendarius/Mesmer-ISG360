import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import {
  FINDING_STATUS_LABELS,
  type FindingStatus,
  type FindingRiskLevel,
  type PhotoType,
} from "@/lib/utils/enums";
import { FINDING_RISK_LEVEL_VISUALS } from "@/lib/utils/risk";
import { FindingEditForm } from "./finding-edit-form";
import { StatusActions } from "./status-actions";
import { PhotoUpload } from "./photo-upload";
import { PhotoGallery } from "./photo-gallery";

interface PageProps {
  params: Promise<{ findingId: string }>;
}

export default async function UygunsuzlukDetayPage({ params }: PageProps) {
  const context = await requireUserContext();
  const { findingId } = await params;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  const { data: finding } = await supabase
    .from("findings")
    .select(
      "*, companies(unvan), company_branches(sube_adi), inspections(id, denetim_tarihi)",
    )
    .eq("id", findingId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!finding) notFound();

  const [{ data: contacts }, { data: photos }, { data: activities }] = await Promise.all([
    supabase
      .from("company_contacts")
      .select("id, ad_soyad, branch_id")
      .eq("company_id", finding.company_id)
      .is("deleted_at", null)
      .order("ad_soyad"),
    supabase
      .from("finding_photos")
      .select("id, storage_path, tip, created_at")
      .eq("finding_id", findingId)
      .order("created_at", { ascending: false }),
    supabase
      .from("corrective_actions")
      .select("id, aciklama, yeni_durum, created_by, created_at")
      .eq("finding_id", findingId)
      .order("created_at", { ascending: false }),
  ]);

  const relevantContacts = (contacts ?? []).filter(
    (c) => c.branch_id === null || c.branch_id === finding.branch_id,
  );

  const signedUrlMap = new Map<string, string>();
  if (photos && photos.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("inspection-photos")
      .createSignedUrls(
        photos.map((p) => p.storage_path),
        3600,
      );
    for (const s of signedUrls ?? []) {
      if (s.path && s.signedUrl) signedUrlMap.set(s.path, s.signedUrl);
    }
  }

  const actorIds = [...new Set((activities ?? []).map((a) => a.created_by))];
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] };
  const actorMap = new Map((actors ?? []).map((a) => [a.id, a.full_name]));

  const riskVisual = FINDING_RISK_LEVEL_VISUALS[finding.risk_seviyesi as FindingRiskLevel];
  const RiskIcon = riskVisual.icon;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{finding.baslik}</CardTitle>
            <p className="text-sm text-mesmer-text-muted">
              {finding.companies?.unvan} · {finding.company_branches?.sube_adi}
            </p>
            {finding.inspections && (
              <Link
                href={`/denetimler/${finding.inspections.id}`}
                className="text-xs text-mesmer-primary hover:underline"
              >
                Denetim: {formatDate(finding.inspections.denetim_tarihi)}
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={finding.durum === "closed_by_expert" ? "default" : "outline"}>
              {FINDING_STATUS_LABELS[finding.durum as FindingStatus]}
            </Badge>
            <span className={`inline-flex items-center gap-1 text-sm font-medium ${riskVisual.textClassName}`}>
              <RiskIcon className="size-4" />
              {riskVisual.label}
            </span>
          </div>
        </CardHeader>
        {finding.regulation_metin_snapshot && (
          <CardContent>
            <p className="text-xs font-medium text-mesmer-text-muted">İlgili Mevzuat</p>
            <p className="text-sm text-mesmer-text whitespace-pre-wrap">{finding.regulation_metin_snapshot}</p>
          </CardContent>
        )}
        {finding.durum === "closed_by_expert" && finding.kapatma_notu && (
          <CardContent>
            <p className="text-xs font-medium text-mesmer-text-muted">
              Kapatma Notu {finding.kapatilma_tarihi && `(${formatDate(finding.kapatilma_tarihi)})`}
            </p>
            <p className="text-sm text-mesmer-text whitespace-pre-wrap">{finding.kapatma_notu}</p>
          </CardContent>
        )}
      </Card>

      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Durum Yönetimi</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusActions findingId={finding.id} currentStatus={finding.durum as FindingStatus} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fotoğraflar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canWrite && (
            <PhotoUpload findingId={finding.id} organizationId={context.activeOrganization.organizationId} />
          )}
          <PhotoGallery
            photos={(photos ?? []).map((p) => ({
              id: p.id,
              url: signedUrlMap.get(p.storage_path) ?? null,
              tip: p.tip as PhotoType,
              created_at: p.created_at,
            }))}
          />
        </CardContent>
      </Card>

      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uygunsuzluk Bilgilerini Düzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <FindingEditForm
              findingId={finding.id}
              contacts={relevantContacts.map((c) => ({ id: c.id, ad_soyad: c.ad_soyad }))}
              defaultValues={{
                baslik: finding.baslik,
                aciklama: finding.aciklama ?? "",
                risk_seviyesi: finding.risk_seviyesi as FindingRiskLevel,
                termin_tarihi: finding.termin_tarihi ?? "",
                sorumlu_kisi_contact_id: finding.sorumlu_kisi_contact_id ?? "",
                sorumlu_kisi_adi: finding.sorumlu_kisi_adi ?? "",
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aktivite Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {!activities || activities.length === 0 ? (
            <p className="text-sm text-mesmer-text-muted">Henüz aktivite kaydı yok.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="border-l-2 border-mesmer-border pl-3">
                  <p className="text-sm text-mesmer-text">{a.aciklama}</p>
                  <p className="text-xs text-mesmer-text-muted">
                    {a.yeni_durum && `${FINDING_STATUS_LABELS[a.yeni_durum as FindingStatus]} · `}
                    {actorMap.get(a.created_by) ?? "—"} · {formatDateTime(a.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
