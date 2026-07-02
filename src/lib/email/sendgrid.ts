import "server-only";
import sgMail from "@sendgrid/mail";

/** SendGrid client'ı. Yalnızca sunucu tarafı kodda (server action / route handler) kullanılır. */
export function getSendGridClient() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");
  return sgMail;
}
