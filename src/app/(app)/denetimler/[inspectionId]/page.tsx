import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/date";
import {
  INSPECTION_STATUS_LABELS,
  INSPECTION_TYPE_LABELS,
  type InspectionStatus,
  type InspectionType,
} from "@/lib/utils/enums";
import { ResponseItem } from "./response-item";
import { CompleteButton } from "./complete-button";
import { DeleteInspectionButton } from "./delete-inspection-button";
import { ReportsCard } from "./reports-card";
import { PreviousOpenFindingsCard } from "./previous-open-findings-card";
import { OfflineSyncProvider } from "./offline-sync-provider";
import { OfflineSyncBanner } from "./offline-sync-banner";

interface PageProps {
  params: Promise<{ inspectionId: string }>;
}

export default async function DenetimDoldurmaPage({ params }: PageProps) {
  const context = await requireUserContext();
  const { inspectionId } = await params;
  const canWrite = hasWriteAccess(context.activeOrganization.role);
  const supabase = await createClient();

  const { data: inspection } = await supabase
    .from("inspections")
    .select("*, companies(unvan), company_branches(sube_adi), company_contacts(ad_soyad)")
    .eq("id", inspectionId)
    .eq("organization_id", context.activeOrganization.organizationId)
    .is("deleted_at", null)
    .single();

  if (!inspection) notFound();

  const { data: uzman } = await supabase.from("profiles").select("full_name").eq("id", inspection.uzman_user_id).single();

  const [{ data: categories }, { data: responses }, { data: findings }] = await Promise.all([
    supabase
      .from("checklist_categories")
      .select("id, ad, sira_no")
      .eq("checklist_template_version_id", inspection.checklist_template_version_id)
      .order("sira_no"),
    supabase
      .from("inspection_responses")
      .select(
        "*, checklist_items(checklist_category_id, zorunlu, fotograf_gerekli, varsayilan_risk_seviyesi, standart_uygunsuzluk_aciklamasi)",
      )
      .eq("inspection_id", inspectionId)
      .order("sira_no"),
    supabase.from("findings").select("id, inspection_response_id, baslik").eq("inspection_id", inspectionId),
  ]);

  const findingMap = new Map((findings ?? []).map((f) => [f.inspection_response_id, { id: f.id, baslik: f.baslik }]));
  const isDraft = inspection.status === "draft";
  const answeredCount = (responses ?? []).filter((r) => r.sonuc).length;
  const totalCount = responses?.length ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{inspection.companies?.unvan}</CardTitle>
            <p className="text-sm text-mesmer-text-muted">
              {inspection.company_branches?.sube_adi && `${inspection.company_branches.sube_adi} · `}
              {formatDate(inspection.denetim_tarihi)} · {INSPECTION_TYPE_LABELS[inspection.denetim_turu as InspectionType]}
            </p>
            <p className="text-sm text-mesmer-text-muted">
              Uzman: {uzman?.full_name ?? "—"}
              {inspection.company_contacts && ` · Yetkili: ${inspection.company_contacts.ad_soyad}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={inspection.status === "completed" ? "default" : "outline"}>
              {INSPECTION_STATUS_LABELS[inspection.status as InspectionStatus]}
            </Badge>
            <p className="text-xs text-mesmer-text-muted">
              {answeredCount}/{totalCount} madde cevaplandı
            </p>
            {isDraft && canWrite && (
              <div className="flex items-center gap-2">
                <DeleteInspectionButton inspectionId={inspection.id} />
                <CompleteButton inspectionId={inspection.id} />
              </div>
            )}
          </div>
        </CardHeader>
        {inspection.genel_notlar && (
          <CardContent>
            <p className="text-sm text-mesmer-text-muted">{inspection.genel_notlar}</p>
          </CardContent>
        )}
      </Card>

      {inspection.status === "completed" && (
        <ReportsCard
          inspectionId={inspection.id}
          organizationId={context.activeOrganization.organizationId}
          canWrite={canWrite}
        />
      )}

      <PreviousOpenFindingsCard
        organizationId={context.activeOrganization.organizationId}
        companyId={inspection.company_id}
        currentInspectionId={inspection.id}
      />

      <OfflineSyncProvider inspectionId={inspection.id}>
        {isDraft && canWrite && <OfflineSyncBanner />}

        {(categories ?? []).map((category) => {
          const categoryResponses = (responses ?? []).filter(
            (r) => r.checklist_items?.checklist_category_id === category.id,
          );
          if (categoryResponses.length === 0) return null;

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-base">{category.ad}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryResponses.map((response) => (
                  <ResponseItem
                    key={response.id}
                    responseId={response.id}
                    siraNo={response.sira_no}
                    soru={response.soru_snapshot}
                    aciklama={response.aciklama_snapshot}
                    regulationReference={response.regulation_reference_snapshot}
                    sonuc={response.sonuc}
                    notMetni={response.not_metni}
                    checklistItem={{
                      zorunlu: response.checklist_items?.zorunlu ?? false,
                      fotograf_gerekli: response.checklist_items?.fotograf_gerekli ?? false,
                      varsayilan_risk_seviyesi: response.checklist_items?.varsayilan_risk_seviyesi ?? "medium",
                      standart_uygunsuzluk_aciklamasi: response.checklist_items?.standart_uygunsuzluk_aciklamasi ?? null,
                    }}
                    existingFinding={findingMap.get(response.id) ?? null}
                    canWrite={canWrite && isDraft}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </OfflineSyncProvider>
    </div>
  );
}
