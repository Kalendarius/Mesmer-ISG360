import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getSendGridClient } from "./sendgrid";

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

/** SendGrid hata gövdesinden (varsa) okunabilir bir mesaj çıkarır. */
function extractSendGridErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const body = (err as { response?: { body?: { errors?: { message?: string }[] } } }).response?.body;
    const messages = body?.errors?.map((e) => e.message).filter(Boolean);
    if (messages && messages.length > 0) return messages.join(" ");
  }
  return err instanceof Error ? err.message : "Bilinmeyen hata.";
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
      const sgMail = getSendGridClient();
      const [response] = await sgMail.send({
        from,
        to: params.to,
        cc: params.cc && params.cc.length > 0 ? params.cc : undefined,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
          disposition: "attachment",
        })),
      });
      servisMesajId = (response.headers["x-message-id"] as string | undefined) ?? null;
    } catch (err) {
      durum = "failed";
      hataMesaji = extractSendGridErrorMessage(err);
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
