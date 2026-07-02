"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext, hasWriteAccess } from "@/lib/auth/session";
import {
  companyCreateSchema,
  toCompanyRecord,
  toMandatoryContactRecords,
  companySchema,
  type CompanyInput,
  type CompanyCreateInput,
} from "@/lib/validation/company";

export interface ActionResult {
  error?: string;
  companyId?: string;
}

export async function createCompanyAction(input: CompanyCreateInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = companyCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .insert({
      ...toCompanyRecord(parsed.data),
      organization_id: context.activeOrganization.organizationId,
      created_by: context.userId,
      updated_by: context.userId,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "İşletme oluşturulamadı: " + error.message };
  }

  const contactRecords = toMandatoryContactRecords(parsed.data).map((c) => ({
    ...c,
    company_id: data.id,
    organization_id: context.activeOrganization.organizationId,
  }));
  const { error: contactError } = await supabase.from("company_contacts").insert(contactRecords);

  if (contactError) {
    return { error: "İşletme oluşturuldu ama yetkililer kaydedilemedi: " + contactError.message };
  }

  revalidatePath("/isletmeler");
  redirect(`/isletmeler/${data.id}`);
}

export async function updateCompanyAction(companyId: string, input: CompanyInput): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ ...toCompanyRecord(parsed.data), updated_by: context.userId })
    .eq("id", companyId);

  if (error) {
    return { error: "İşletme güncellenemedi: " + error.message };
  }

  revalidatePath("/isletmeler");
  revalidatePath(`/isletmeler/${companyId}`);
  redirect(`/isletmeler/${companyId}`);
}

export async function setCompanyActiveAction(companyId: string, isActive: boolean): Promise<ActionResult> {
  const context = await requireUserContext();
  if (!hasWriteAccess(context.activeOrganization.role)) {
    return { error: "Bu işlem için yetkiniz yok." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ is_active: isActive, updated_by: context.userId })
    .eq("id", companyId);

  if (error) {
    return { error: "Durum güncellenemedi: " + error.message };
  }

  revalidatePath("/isletmeler");
  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}
