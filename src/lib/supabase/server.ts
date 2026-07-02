import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server Component / Server Action içinde kullanılacak Supabase client'ı.
 * Oturum çerezleri üzerinden çalışır, RLS'e tabidir (kullanıcının kendi
 * yetkileriyle sorgu yapar — service-role kullanmaz).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component içinden çağrıldığında cookie set edilemez;
            // middleware oturum yenilemesini zaten üstlenir.
          }
        },
      },
    },
  );
}
