import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { appConfig, hasSupabaseConfig } from "@/lib/config";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(
    appConfig.supabaseUrl as string,
    appConfig.supabaseAnonKey as string,
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
            // Server Components cannot set cookies. Middleware refreshes auth cookies.
          }
        },
      },
    },
  );
}
