"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/auth/session";
import {
  branchSchema,
  contactSchema,
  toBranchRecord,
  toContactRecord,
  type BranchInput,
  type ContactInput,
} from "@/lib/validation/company";

export interface ActionResult {
  error?: string;
}

function assertWriteAccess(role: string): string | null {
  if (role !== "organization_admin" && role !== "safety_expert") {
    return "Bu işlem için yetkiniz yok.";
  }
  return null;
}

export async function createBranchAction(companyId: string, input: BranchInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("company_branches").insert({
    ...toBranchRecord(parsed.data),
    company_id: companyId,
    organization_id: context.activeOrganization.organizationId,
    created_by: context.userId,
    updated_by: context.userId,
  });

  if (error) return { error: "Şube oluşturulamadı: " + error.message };

  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}

export async function updateBranchAction(
  companyId: string,
  branchId: string,
  input: BranchInput,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_branches")
    .update({ ...toBranchRecord(parsed.data), updated_by: context.userId })
    .eq("id", branchId);

  if (error) return { error: "Şube güncellenemedi: " + error.message };

  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}

export async function setBranchActiveAction(
  companyId: string,
  branchId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_branches")
    .update({ is_active: isActive, updated_by: context.userId })
    .eq("id", branchId);

  if (error) return { error: "Durum güncellenemedi: " + error.message };

  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}

export async function createContactAction(companyId: string, input: ContactInput): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("company_contacts").insert({
    ...toContactRecord(parsed.data),
    company_id: companyId,
    organization_id: context.activeOrganization.organizationId,
  });

  if (error) return { error: "Yetkili oluşturulamadı: " + error.message };

  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}

export async function updateContactAction(
  companyId: string,
  contactId: string,
  input: ContactInput,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };

  const supabase = await createClient();
  const { error } = await supabase.from("company_contacts").update(toContactRecord(parsed.data)).eq("id", contactId);

  if (error) return { error: "Yetkili güncellenemedi: " + error.message };

  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}

export async function setContactActiveAction(
  companyId: string,
  contactId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const context = await requireUserContext();
  const denied = assertWriteAccess(context.activeOrganization.role);
  if (denied) return { error: denied };

  const supabase = await createClient();
  const { error } = await supabase.from("company_contacts").update({ is_active: isActive }).eq("id", contactId);

  if (error) return { error: "Durum güncellenemedi: " + error.message };

  revalidatePath(`/isletmeler/${companyId}`);
  return {};
}
