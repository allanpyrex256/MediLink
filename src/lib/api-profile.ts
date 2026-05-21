import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dashboardRole } from "@/lib/rbac";

export async function getAuthenticatedApiProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, tenant_id, role, is_platform_admin")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    profile: profile as {
      id: string;
      tenant_id: string;
      role: string;
      is_platform_admin: boolean;
    } | null,
  };
}

export function canManageClinicalSetup(role: string) {
  return dashboardRole(role) === "owner";
}

export function canManagePharmacy(role: string) {
  const normalized = dashboardRole(role);
  return normalized === "owner" || normalized === "pharmacist";
}

export function canManageFinance(role: string) {
  const normalized = dashboardRole(role);
  return normalized === "owner" || normalized === "seller";
}
