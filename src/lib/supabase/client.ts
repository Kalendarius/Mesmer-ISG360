import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/** Tarayıcıda kullanılacak Supabase client'ı. Yalnızca anon key kullanır, RLS'e tabidir. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
