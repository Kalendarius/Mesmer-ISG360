"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/log";
import { todayIstanbulISODate } from "@/lib/utils/date";
import type { Database } from "@/types/database.types";

type FindingUpdate = Database["public"]["Tables"]["findings"]["Update"];
import {
  findingUpdateSchema,
  findingStatusChangeSchema,
  photoRecordSchema,
  toFindingUpdateRecord,
  type FindingUpdateInput,
  type FindingStatusChangeInput,
  type PhotoRecordInput,
} from "@/lib/validation/finding";

export interface ActionResult {
  error?: string;
}

function assertWriteAccess(role: string): string | null {
  if (role !== "organization_admin" && role !== "safety_expert") {
    return "Bu işlem için yetkiniz yok.";
  }
  return null;
}

export async function updateFindingAction(findingId: string, input: FindingUpdateInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = findingUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("findings")
    .update({ ...toFindingUpdateRecord(parsed.data), updated_by: context.userId })
    .eq("id", findingId);

  if (error) return { error: "Uygunsuzluk güncellenemedi: " + error.message };

  revalidatePath(`/uygunsuzluklar/${findingId}`);
  return {};
}

export async function changeFindingStatusAction(
  findingId: string,
  input: FindingStatusChangeInput,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = findingStatusChangeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  const { yeni_durum, aciklama, kapatma_notu } = parsed.data;

  if (yeni_durum === "closed_by_expert" && !kapatma_notu) {
    return { error: "Uygunsuzluğu kapatmak için bir kapatma notu girin." };
  }

  const supabase = await createClient();

  const { data: finding } = await supabase
    .from("findings")
    .select("organization_id, durum")
    .eq("id", findingId)
    .single();
  if (!finding) return { error: "Uygunsuzluk bulunamadı." };

  const update: FindingUpdate = {
    durum: yeni_durum,
    updated_by: context.userId,
  };
  if (yeni_durum === "closed_by_expert") {
    update.kapatma_notu = kapatma_notu;
    update.kapatilma_tarihi = todayIstanbulISODate();
  } else if (finding.durum === "closed_by_expert") {
    update.kapatma_notu = null;
    update.kapatilma_tarihi = null;
  }

  const { error: updateError } = await supabase.from("findings").update(update).eq("id", findingId);
  if (updateError) return { error: "Durum güncellenemedi: " + updateError.message };

  const { error: logError } = await supabase.from("corrective_actions").insert({
    finding_id: findingId,
    organization_id: finding.organization_id,
    aciklama,
    yeni_durum,
    created_by: context.userId,
  });
  if (logError) return { error: "Aktivite kaydedilemedi: " + logError.message };

  if (yeni_durum === "closed_by_expert") {
    await logAudit(supabase, {
      organizationId: finding.organization_id,
      actorUserId: context.userId,
      action: "finding.closed",
      entityType: "findings",
      entityId: findingId,
      oncekiVeri: { durum: finding.durum },
      yeniVeri: { durum: yeni_durum, kapatma_notu },
    });
  }

  revalidatePath(`/uygunsuzluklar/${findingId}`);
  revalidatePath("/uygunsuzluklar");
  return {};
}

export async function recordFindingPhotoAction(findingId: string, input: PhotoRecordInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = photoRecordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("finding_photos").insert({
    finding_id: findingId,
    organization_id: context.activeOrganization.organizationId,
    storage_path: parsed.data.storage_path,
    tip: parsed.data.tip,
    created_by: context.userId,
  });

  if (error) return { error: "Fotoğraf kaydedilemedi: " + error.message };

  revalidatePath(`/uygunsuzluklar/${findingId}`);
  return {};
}
