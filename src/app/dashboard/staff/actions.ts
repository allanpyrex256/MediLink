"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { getCurrentDemoWorkspaceId, getDashboardData } from "@/lib/data/repositories";
import { saveLocalDemoStaffMember } from "@/lib/local-demo-store";
import { normalizeUgandanPhone } from "@/lib/phone";
import { canManageStaff, dashboardRoleLabel } from "@/lib/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser, StaffInvitation, UserRole } from "@/lib/types";

type StaffRole = Exclude<UserRole, "patient">;

const staffRoles = ["seller", "pharmacist"] as const;

const staffSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the staff member's full name."),
  phone: z.string().trim().min(7, "Enter a phone number."),
  password: z.string().min(8, "Temporary password must be at least 8 characters."),
  role: z.enum(staffRoles),
});

export type StaffInviteState = {
  message: string;
  status: "idle" | "success" | "error";
};

export async function inviteStaffMember(
  _previousState: StaffInviteState,
  formData: FormData,
): Promise<StaffInviteState> {
  const parsed = staffSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .find(Boolean);

    return {
      status: "error",
      message: firstError ?? "Check the staff details and try again.",
    };
  }

  const phone = normalizeUgandanPhone(parsed.data.phone);
  if (!phone) return { status: "error", message: "Enter a valid phone number." };

  if (!hasSupabaseConfig()) {
    return addDemoStaffMember({ ...parsed.data, phone });
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      status: "error",
      message: "Adding staff needs SUPABASE_SERVICE_ROLE_KEY so MediLink can create phone login accounts.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "You must be signed in to add staff." };

  const { data: profile } = await supabase
    .from("users")
    .select("id, tenant_id, role, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (!profile || !canManageStaff(profile.role, profile.is_platform_admin)) {
    return { status: "error", message: "Only an owner or admin can add staff accounts." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.createUser({
    phone,
    password: parsed.data.password,
    phone_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      phone,
      role: parsed.data.role,
      tenant_id: profile.tenant_id,
    },
  });

  if (error) {
    const needsMigration = error.message.toLowerCase().includes("database error creating new user");

    return {
      status: "error",
      message: needsMigration
        ? "Database is not ready for phone staff accounts. Run the Supabase migration 20260521170000_three_role_phone_auth.sql, then try again."
        : error.message,
    };
  }

  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `${parsed.data.fullName} can now log in as ${dashboardRoleLabel(parsed.data.role)} using ${phone}.`,
  };
}

async function addDemoStaffMember(
  staff: z.infer<typeof staffSchema> & { phone: string },
): Promise<StaffInviteState> {
  const data = await getDashboardData();

  if (!canManageStaff(data.user.role, data.user.is_platform_admin)) {
    return { status: "error", message: "Only an owner or admin can add staff accounts." };
  }

  const workspaceId = await getCurrentDemoWorkspaceId();
  const now = new Date().toISOString();
  const syntheticEmail = `${staff.phone.replace(/\D/g, "")}@phone.medilink.local`;
  const invitation: StaffInvitation = {
    id: `local-staff-${crypto.randomUUID()}`,
    tenant_id: data.tenant.id,
    email: syntheticEmail,
    full_name: staff.fullName,
    role: staff.role as StaffRole,
    phone: staff.phone,
    status: "accepted",
    invited_by: data.user.id,
    sent_at: now,
    accepted_at: now,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: now,
    updated_at: now,
  };
  const user: AppUser = {
    id: `local-user-${crypto.randomUUID()}`,
    tenant_id: data.tenant.id,
    email: syntheticEmail,
    full_name: staff.fullName,
    role: staff.role as UserRole,
    phone: staff.phone,
    avatar_url: null,
    is_platform_admin: false,
    last_seen_at: null,
  };

  await saveLocalDemoStaffMember({ workspaceId, invitation, user });
  revalidatePath("/dashboard/staff");

  return {
    status: "success",
    message: `${staff.fullName} was added locally as ${dashboardRoleLabel(staff.role)}.`,
  };
}
