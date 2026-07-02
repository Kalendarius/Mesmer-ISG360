import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayIstanbulISODate } from "@/lib/utils/date";

const REPORT_NO_PREFIX = "ISG";

/**
 * Örn. "ISG-2026-000123" — yıl + sıra no. Kasıtlı olarak kuruluş adından
 * (ör. "MESMER") bağımsız, nötr bir önek kullanılır: bu rapor doğrudan
 * denetlenen işletmeye gidiyor ve İSG uzmanının/denetim kuruluşunun ticari
 * kimliği raporda yer almamalı (bkz. CLAUDE.md → PDF Raporlama). Sıra no
 * tüm kuruluşlar arasında paylaşılan tek bir önek kullandığından, sayım
 * RLS'e tabi olmayan service-role client ile (yalnızca bu sayım için)
 * yapılır — aksi halde her kuruluş kendi RLS'e tabi görünürlüğü içinde
 * ayrı ayrı sayar ve aynı numarayı üretip `report_no` unique kısıtını ihlal
 * edebilir.
 */
export async function generateReportNo(): Promise<string> {
  const admin = createAdminClient();
  const year = todayIstanbulISODate().slice(0, 4);
  const likePattern = `${REPORT_NO_PREFIX}-${year}-%`;

  const { count } = await admin.from("reports").select("id", { count: "exact", head: true }).like("report_no", likePattern);

  const sequence = (count ?? 0) + 1;
  return `${REPORT_NO_PREFIX}-${year}-${String(sequence).padStart(6, "0")}`;
}
