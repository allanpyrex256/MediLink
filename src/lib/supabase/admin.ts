import { createClient } from "@supabase/supabase-js";
import { appConfig, hasSupabaseAdminConfig } from "@/lib/config";

export function createSupabaseAdminClient() {
  if (!hasSupabaseAdminConfig()) {
    throw new Error(
      "Supabase admin access is not configured. Add SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(
    appConfig.supabaseUrl as string,
    appConfig.supabaseServiceRoleKey as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
