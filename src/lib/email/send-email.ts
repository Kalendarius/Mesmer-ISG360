import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getResendClient } from "./resend";

interface SendEmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendEmailParams {
  organizationId: string;
  inspectionId?: string | null;
  reportId?: string | null;
  findingId?: string | null;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  attachments?: SendEmailAttachment[];
  gonderenUserId: string | null;
}

export interface SendEmailResult {
  error?: string;
}

/**
 * E-posta gönderir ve sonucu (başarılı/başarısız) `email_logs`'a yazar.
 * Gönderim başarısız olsa bile satır her zaman eklenir — sessizce yutulan
 * hata olmaz (bkz. CLAUDE.md kural 9).
 */
export async function sendAndLogEmail(
  supabase: SupabaseClient<Database>,
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM;
  let durum: "sent" | "failed" = "sent";
  let hataMesaji: string | null = null;
  let servisMesajId: string | null = null;

  if (!from) {
    durum = "failed";
    hataMesaji = "EMAIL_FROM ortam değişkeni tanımlı değil.";
  } else {
    try {
      const resend = getResendClient();
      const { data, error } = await resend.emails.send({
        from,
        to: params.to,
        cc: params.cc && params.cc.length > 0 ? params.cc : undefined,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
      });
      if (error) {
        durum = "failed";
        hataMesaji = error.message;
      } else {
        servisMesajId = data?.id ?? null;
      }
    } catch (err) {
      durum = "failed";
      hataMesaji = err instanceof Error ? err.message : "Bilinmeyen hata.";
    }
  }

  await supabase.from("email_logs").insert({
    organization_id: params.organizationId,
    inspection_id: params.inspectionId ?? null,
    report_id: params.reportId ?? null,
    finding_id: params.findingId ?? null,
    alicilar: params.to,
    cc: params.cc && params.cc.length > 0 ? params.cc : null,
    konu: params.subject,
    mesaj: params.html,
    gonderen_user_id: params.gonderenUserId,
    servis_mesaj_id: servisMesajId,
    durum,
    hata_mesaji: hataMesaji,
  });

  return durum === "failed" ? { error: hataMesaji ?? "E-posta gönderilemedi." } : {};
}
