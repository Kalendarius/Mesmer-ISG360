import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

interface LogAuditParams {
  organizationId: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oncekiVeri?: unknown;
  yeniVeri?: unknown;
}

/** Önemli işlemleri audit_logs'a yazar (append-only, bkz. CLAUDE.md kural 5). */
export async function logAudit(
  supabase: SupabaseClient<Database>,
  { organizationId, actorUserId, action, entityType, entityId, oncekiVeri, yeniVeri }: LogAuditParams,
) {
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    onceki_veri: (oncekiVeri as never) ?? null,
    yeni_veri: (yeniVeri as never) ?? null,
  });
}
