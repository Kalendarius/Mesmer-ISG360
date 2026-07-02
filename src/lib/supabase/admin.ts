import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role client. RLS'i tamamen atlar. YALNIZCA route handler
 * içinde, güvenilir sunucu işlemleri için kullanılır (rapor üretimi,
 * e-posta gönderimi, kullanıcı davet etme gibi). Hiçbir Server/Client
 * Component içinde import edilmemelidir. `server-only` paketi bunu build
 * zamanında garanti eder.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
