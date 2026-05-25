"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import {
  getTenantPasswordResetAccount,
  isDeliverablePasswordResetEmail,
  passwordResetRedirectUrl,
  sendPasswordResetOtp,
} from "@/lib/password-reset";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TenantStatus } from "@/lib/types";

type TenantAccessStatus = Extract<TenantStatus, "trialing" | "past_due">;
export type TenantAdminPasswordResetState = {
  message: string;
  status: "idle" | "success" | "error";
};

const platformPaths = [
  "/super-admin",
  "/super-admin/hospitals",
  "/super-admin/clinics",
  "/super-admin/dentistry",
  "/super-admin/pharmacies",
  "/super-admin/subscriptions",
  "/super-admin/activity",
  "/super-admin/billing",
  "/super-admin/payments",
  "/super-admin/revenue",
  "/super-admin/analytics",
];

export async function deleteTenantAccount(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");

  if (!tenantId) {
    throw new Error("Missing tenant account.");
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    throw new Error("Platform admin access is required to delete tenant accounts.");
  }

  const { user, profile } = await requirePlatformOwner("delete tenant accounts");

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

  revalidatePlatformPaths();
}

export async function updateTenantAccessStatus(formData: FormData) {
  const tenantId = String(formData.get("tenantId") ?? "");
  const status = String(formData.get("status") ?? "") as TenantAccessStatus;

  if (!tenantId) {
    throw new Error("Missing tenant account.");
  }

  if (status !== "trialing" && status !== "past_due") {
    throw new Error("Choose a valid tenant access status.");
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    throw new Error("Platform admin access is required to manage tenant access.");
  }

  const { profile } = await requirePlatformOwner("manage tenant access");

  if (profile.tenant_id === tenantId && status === "past_due") {
    throw new Error("You cannot disable your own platform owner workspace.");
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

  const now = new Date();
  const { error: tenantUpdateError } = await admin
    .from("tenants")
    .update({ status })
    .eq("id", tenantId);

  if (tenantUpdateError) {
    throw new Error(tenantUpdateError.message);
  }

  const { data: subscriptions } = await admin
    .from("subscriptions")
    .select("id")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(1);
  const subscription = subscriptions?.[0];

  if (subscription) {
    const graceEndsAt = nextGraceReviewDate(now).toISOString();
    const subscriptionPatch =
      status === "trialing"
        ? {
            status: "trialing",
            current_period_start: now.toISOString(),
            current_period_end: graceEndsAt,
            trial_ends_at: graceEndsAt,
          }
        : {
            status: "past_due",
            current_period_end: now.toISOString(),
            trial_ends_at: now.toISOString(),
          };
    const { error: subscriptionUpdateError } = await admin
      .from("subscriptions")
      .update(subscriptionPatch)
      .eq("id", subscription.id);

    if (subscriptionUpdateError) {
      throw new Error(subscriptionUpdateError.message);
    }
  }

  revalidatePlatformPaths();
}

export async function sendTenantAdminPasswordResetOtp(
  _previousState: TenantAdminPasswordResetState,
  formData: FormData,
): Promise<TenantAdminPasswordResetState> {
  const tenantId = String(formData.get("tenantId") ?? "");

  if (!tenantId) {
    return { status: "error", message: "Missing tenant account." };
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return {
      status: "error",
      message: "Platform admin email access is required to send password reset OTPs.",
    };
  }

  try {
    const { user } = await requirePlatformOwner("send admin password reset OTPs");
    const admin = createSupabaseAdminClient();
    const { data: tenant, error: tenantError } = await admin
      .from("tenants")
      .select("id, name")
      .eq("id", tenantId)
      .single();

    if (tenantError || !tenant) {
      return { status: "error", message: "Tenant account was not found." };
    }

    const recipient = await getTenantPasswordResetAccount(admin, tenantId);

    if (!recipient) {
      return {
        status: "error",
        message: `${tenant.name} has no owner or admin account to reset.`,
      };
    }

    if (!isDeliverablePasswordResetEmail(recipient.email)) {
      return {
        status: "error",
        message:
          "This owner/admin signs in by phone and has no real email attached for OTP delivery.",
      };
    }

    await sendPasswordResetOtp(
      admin,
      recipient.email,
      passwordResetRedirectUrl,
    );

    await admin.from("audit_logs").insert({
      tenant_id: tenantId,
      actor_id: user.id,
      action: "password_reset_otp_sent",
      entity_table: "users",
      entity_id: recipient.id,
      metadata: {
        recipient_email: recipient.email,
        recipient_role: recipient.role,
      },
    });

    return {
      status: "success",
      message: `MediLink reset OTP sent to ${recipient.email}.`,
    };
  } catch (caught) {
    return {
      status: "error",
      message: caught instanceof Error ? caught.message : "Unable to send reset OTP.",
    };
  }
}

async function requirePlatformOwner(action: string) {
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
    throw new Error(`Only the MediLink platform owner can ${action}.`);
  }

  return {
    user,
    profile: profile as { tenant_id: string; is_platform_admin: boolean },
  };
}

function revalidatePlatformPaths() {
  for (const path of platformPaths) {
    revalidatePath(path);
  }
}

function nextGraceReviewDate(from: Date) {
  const next = new Date(from);
  next.setDate(next.getDate() + 7);

  return next;
}
