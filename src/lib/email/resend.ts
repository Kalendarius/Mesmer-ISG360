import "server-only";
import { Resend } from "resend";

/** Resend client'ı. Yalnızca sunucu tarafı kodda (server action / route handler) kullanılır. */
export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}
