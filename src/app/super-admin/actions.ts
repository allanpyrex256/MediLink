"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function deleteTenantAccount(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");

  if (!tenantId) {
    throw new Error("Missing tenant account.");
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    throw new Error("Supabase admin access is required to delete tenant accounts.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("tenant_id, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_platform_admin) {
    throw new Error("Only the MediLink platform owner can delete tenant accounts.");
  }

  if (profile.tenant_id === tenantId) {
    throw new Error("You cannot delete your own platform owner workspace.");
  }

  const admin = createSupabaseAdminClient();
  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id")
    .eq("id", tenantId)
    .single();

  if (tenantError || !tenant) {
    throw new Error("Tenant account was not found.");
  }

  const { data: tenantUsers } = await admin
    .from("users")
    .select("id")
    .eq("tenant_id", tenantId);

  const { error: deleteError } = await admin
    .from("tenants")
    .delete()
    .eq("id", tenantId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  await Promise.all(
    (tenantUsers ?? [])
      .filter((tenantUser) => tenantUser.id !== user.id)
      .map((tenantUser) => admin.auth.admin.deleteUser(tenantUser.id)),
  );

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/hospitals");
  revalidatePath("/super-admin/clinics");
  revalidatePath("/super-admin/dentistry");
  revalidatePath("/super-admin/pharmacies");
  revalidatePath("/super-admin/subscriptions");
  revalidatePath("/super-admin/billing");
  revalidatePath("/super-admin/payments");
}
