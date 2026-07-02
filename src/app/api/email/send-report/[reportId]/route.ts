import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserContext, hasWriteAccess } from "@/lib/auth/session";
import { sendAndLogEmail } from "@/lib/email/send-email";
import { formatDate } from "@/lib/utils/date";
import { escapeHtml } from "@/lib/utils/html";

interface RouteParams {
  params: Promise<{ reportId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { reportId } = await params;
  const context = await getUserContext();
  if (!context) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const organizationId = context.activeOrganization.organizationId;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("id, report_no, inspection_id, pdf_storage_path")
    .eq("id", reportId)
    .eq("organization_id", organizationId)
    .single();
  if (!report) return NextResponse.json({ error: "Rapor bulunamadı." }, { status: 404 });

  const { data: inspection } = await supabase
    .from("inspections")
    .select("denetim_tarihi, company_id, yetkili_contact_id, companies(unvan), company_contacts(ad_soyad, eposta)")
    .eq("id", report.inspection_id)
    .single();
  if (!inspection) return NextResponse.json({ error: "Denetim bulunamadı." }, { status: 404 });

  const yetkiliEposta = inspection.company_contacts?.eposta;
  if (!yetkiliEposta) {
    return NextResponse.json(
      { error: "İşletme yetkilisinin e-posta adresi tanımlı değil. Denetim başlığından yetkili bilgisini güncelleyin." },
      { status: 400 },
    );
  }

  const { data: notificationSettings } = await supabase
    .from("notification_settings")
    .select("default_cc")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const { data: pdfBlob, error: downloadError } = await supabase.storage
    .from("report-pdfs")
    .download(report.pdf_storage_path);
  if (downloadError || !pdfBlob) {
    return NextResponse.json({ error: "Rapor PDF'i indirilemedi: " + (downloadError?.message ?? "bilinmeyen hata") }, { status: 500 });
  }
  const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

  const companyUnvan = escapeHtml(inspection.companies?.unvan ?? "");
  const yetkiliAdi = escapeHtml(inspection.company_contacts?.ad_soyad ?? "İlgili");
  const subject = `İSG Denetim Raporu — ${report.report_no}`;
  const html = `
    <p>Sayın ${yetkiliAdi},</p>
    <p>${companyUnvan} işletmenizde ${formatDate(inspection.denetim_tarihi)} tarihinde gerçekleştirilen iş sağlığı ve güvenliği denetimine ait rapor ekte yer almaktadır.</p>
    <p>Rapor No: ${report.report_no}</p>
  `.trim();

  const result = await sendAndLogEmail(supabase, {
    organizationId,
    inspectionId: report.inspection_id,
    reportId: report.id,
    to: [yetkiliEposta],
    cc: notificationSettings?.default_cc ?? undefined,
    subject,
    html,
    attachments: [{ filename: `${report.report_no}.pdf`, content: pdfBuffer }],
    gonderenUserId: context.userId,
  });

  if (result.error) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true });
}
