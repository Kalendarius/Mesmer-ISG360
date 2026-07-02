import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils/date";
import { EMAIL_STATUS_LABELS, type EmailStatus } from "@/lib/utils/enums";
import { GenerateReportButton } from "./generate-report-button";
import { SendReportEmailButton } from "./send-report-email-button";

interface ReportsCardProps {
  inspectionId: string;
  organizationId: string;
  canWrite: boolean;
}

export async function ReportsCard({ inspectionId, organizationId, canWrite }: ReportsCardProps) {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, report_no, generated_at, generated_by, pdf_storage_path")
    .eq("inspection_id", inspectionId)
    .eq("organization_id", organizationId)
    .order("generated_at", { ascending: false });

  const generatorIds = [...new Set((reports ?? []).map((r) => r.generated_by))];
  const { data: generators } = generatorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", generatorIds)
    : { data: [] };
  const generatorMap = new Map((generators ?? []).map((g) => [g.id, g.full_name]));

  const signedUrlMap = new Map<string, string>();
  if (reports && reports.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("report-pdfs")
      .createSignedUrls(
        reports.map((r) => r.pdf_storage_path),
        3600,
      );
    for (const s of signedUrls ?? []) {
      if (s.path && s.signedUrl) signedUrlMap.set(s.path, s.signedUrl);
    }
  }

  const reportIds = (reports ?? []).map((r) => r.id);
  const { data: emailLogs } = reportIds.length
    ? await supabase
        .from("email_logs")
        .select("report_id, durum, gonderim_zamani")
        .in("report_id", reportIds)
        .order("gonderim_zamani", { ascending: false })
    : { data: [] };
  const lastEmailByReport = new Map<string, { durum: EmailStatus; gonderim_zamani: string }>();
  for (const log of emailLogs ?? []) {
    if (log.report_id && !lastEmailByReport.has(log.report_id)) {
      lastEmailByReport.set(log.report_id, { durum: log.durum, gonderim_zamani: log.gonderim_zamani });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Raporlar</CardTitle>
        {canWrite && <GenerateReportButton inspectionId={inspectionId} />}
      </CardHeader>
      <CardContent>
        {!reports || reports.length === 0 ? (
          <p className="text-sm text-mesmer-text-muted">Henüz rapor oluşturulmadı.</p>
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => {
              const lastEmail = lastEmailByReport.get(r.id);
              return (
                <li key={r.id} className="rounded-md border border-mesmer-border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mesmer-text">{r.report_no}</p>
                      <p className="text-xs text-mesmer-text-muted">
                        {formatDateTime(r.generated_at)} · {generatorMap.get(r.generated_by) ?? "—"}
                      </p>
                      {lastEmail && (
                        <p className="text-xs text-mesmer-text-muted">
                          E-posta: {EMAIL_STATUS_LABELS[lastEmail.durum]} · {formatDateTime(lastEmail.gonderim_zamani)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {signedUrlMap.get(r.pdf_storage_path) && (
                        <a
                          href={signedUrlMap.get(r.pdf_storage_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-mesmer-primary hover:underline"
                        >
                          İndir
                        </a>
                      )}
                      {canWrite && <SendReportEmailButton reportId={r.id} />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
