import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getUserContext, hasWriteAccess } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { formatDateTime } from "@/lib/utils/date";
import { buildInspectionReportData } from "@/lib/pdf/build-report-data";
import { generateReportNo } from "@/lib/pdf/report-number";
import { InspectionReportDocument } from "@/lib/pdf/inspection-report-document";

interface RouteParams {
  params: Promise<{ inspectionId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { inspectionId } = await params;
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const organizationId = context.activeOrganization.organizationId;
  const supabase = await createClient();

  const { data: inspection } = await supabase
    .from("inspections")
    .select("id, status")
    .eq("id", inspectionId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .single();

  if (!inspection) return NextResponse.json({ error: "Denetim bulunamadı." }, { status: 404 });
  if (inspection.status !== "completed") {
    return NextResponse.json({ error: "Yalnızca tamamlanmış denetimler için rapor üretilebilir." }, { status: 400 });
  }

  const reportData = await buildInspectionReportData(supabase, organizationId, inspectionId);
  if (!reportData) return NextResponse.json({ error: "Rapor verisi oluşturulamadı." }, { status: 500 });

  const photoPaths = reportData.findings.flatMap((f) => f.photos.map((p) => p.storagePath));
  const photoImages: Record<string, { data: Buffer; format: "png" | "jpg" }> = {};
  for (const path of photoPaths) {
    const { data: blob } = await supabase.storage.from("inspection-photos").download(path);
    if (!blob) continue;
    const buffer = Buffer.from(await blob.arrayBuffer());
    const format: "png" | "jpg" = path.toLowerCase().endsWith(".png") ? "png" : "jpg";
    photoImages[path] = { data: buffer, format };
  }

  const reportNo = await generateReportNo();
  const generatedAt = new Date();
  const generatedByName = context.fullName ?? context.email;

  const pdfBuffer = await renderToBuffer(
    <InspectionReportDocument
      data={reportData}
      reportNo={reportNo}
      generatedAtFormatted={formatDateTime(generatedAt)}
      generatedByName={generatedByName}
      photoImages={photoImages}
    />,
  );

  const reportId = crypto.randomUUID();
  const pdfStoragePath = `${organizationId}/reports/${reportId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("report-pdfs")
    .upload(pdfStoragePath, pdfBuffer, { contentType: "application/pdf" });
  if (uploadError) {
    return NextResponse.json({ error: "PDF yüklenemedi: " + uploadError.message }, { status: 500 });
  }

  const { error: reportError } = await supabase.from("reports").insert({
    id: reportId,
    organization_id: organizationId,
    inspection_id: inspectionId,
    report_no: reportNo,
    generated_by: context.userId,
    generated_at: generatedAt.toISOString(),
    pdf_storage_path: pdfStoragePath,
  });
  if (reportError) {
    return NextResponse.json({ error: "Rapor kaydedilemedi: " + reportError.message }, { status: 500 });
  }

  const { error: snapshotError } = await supabase.from("report_snapshots").insert({
    report_id: reportId,
    organization_id: organizationId,
    snapshot_json: reportData as never,
  });
  if (snapshotError) {
    return NextResponse.json({ error: "Rapor anlık görüntüsü kaydedilemedi: " + snapshotError.message }, { status: 500 });
  }

  await logAudit(supabase, {
    organizationId,
    actorUserId: context.userId,
    action: "report.generated",
    entityType: "reports",
    entityId: reportId,
    yeniVeri: { report_no: reportNo, inspection_id: inspectionId },
  });

  return NextResponse.json({ reportId, reportNo });
}
