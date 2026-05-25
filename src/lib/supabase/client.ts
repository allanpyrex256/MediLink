"use client";

import { createBrowserClient } from "@supabase/ssr";
import { appConfig, hasSupabaseConfig } from "@/lib/config";
import { authCookieNameForTab, getOrCreateAuthTabId } from "@/lib/supabase/session-scope";

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient(
    appConfig.supabaseUrl as string,
    appConfig.supabaseAnonKey as string,
    {
      cookieOptions: {
        name: authCookieNameForTab(getOrCreateAuthTabId()),
        path: "/",
        sameSite: "lax",
      },
      isSingleton: false,
    },
  );
}

export { hasSupabaseConfig };
