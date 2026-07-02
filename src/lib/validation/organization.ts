import { z } from "zod";
import { USER_ROLES } from "@/lib/utils/enums";

const optionalString = z.string().optional().or(z.literal(""));

export const organizationSettingsSchema = z.object({
  display_name: z.string().min(1, "Görünen ad zorunludur."),
  phone: optionalString,
  email: optionalString,
  website: optionalString,
  address: optionalString,
});
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;

function nullIfEmpty(value: string | undefined): string | null {
  return value ? value : null;
}

export function toOrganizationRecord(input: OrganizationSettingsInput) {
  return {
    display_name: input.display_name,
    phone: nullIfEmpty(input.phone),
    email: nullIfEmpty(input.email),
    website: nullIfEmpty(input.website),
    address: nullIfEmpty(input.address),
  };
}

export const notificationSettingsSchema = z.object({
  gonderen_adi: optionalString,
  yanit_adresi: optionalString,
  default_cc: optionalString,
});
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

/** Virgül veya satır sonuyla ayrılmış e-posta listesini diziye çevirir, boşları eler. */
function parseEmailList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function toNotificationSettingsRecord(input: NotificationSettingsInput) {
  return {
    gonderen_adi: nullIfEmpty(input.gonderen_adi),
    yanit_adresi: nullIfEmpty(input.yanit_adresi),
    default_cc: parseEmailList(input.default_cc),
  };
}

const INVITABLE_ROLES = USER_ROLES.filter((r) => r !== "company_contact") as [
  Exclude<(typeof USER_ROLES)[number], "company_contact">,
  ...Exclude<(typeof USER_ROLES)[number], "company_contact">[],
];

export const inviteUserSchema = z.object({
  email: z.string().min(1, "E-posta zorunludur.").email("Geçerli bir e-posta adresi girin."),
  role: z.enum(INVITABLE_ROLES),
});
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
