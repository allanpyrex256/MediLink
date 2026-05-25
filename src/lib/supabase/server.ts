import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { appConfig, hasSupabaseConfig } from "@/lib/config";
import { AUTH_TAB_HEADER, authCookieNameForTab } from "@/lib/supabase/session-scope";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();
  const headerStore = await headers();

  return createServerClient(
    appConfig.supabaseUrl as string,
    appConfig.supabaseAnonKey as string,
    {
      cookieOptions: {
        name: authCookieNameForTab(headerStore.get(AUTH_TAB_HEADER)),
        path: "/",
        sameSite: "lax",
      },
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
            // Server Components cannot set cookies. Middleware refreshes auth cookies.
          }
        },
      },
    },
  );
}
