import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://tayyqzsuccmqdnphqdwm.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_bDBft1tAtPBpRZgv_KBCPw_Nhk_RYbS";

/**
 * Server-side Supabase client. Use inside Server Components, Route
 * Handlers, and Server Actions. Reads auth cookies for RLS.
 *
 * NOTE: with Next.js 16 the `cookies()` helper is async, so this
 * factory is async too.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `set` throws in read-only contexts (like a pure Server Component).
          // Supabase refreshes the session via middleware, so it's fine.
        }
      },
    },
  });
}
