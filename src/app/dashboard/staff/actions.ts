"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appConfig, hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { getCurrentDemoWorkspaceId, getDashboardData } from "@/lib/data/repositories";
import { saveLocalDemoStaffMember } from "@/lib/local-demo-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser, StaffInvitation, TenantKind, UserRole } from "@/lib/types";

const staffRoles = ["admin", "doctor", "dentist", "receptionist", "pharmacist"] as const;

const inviteStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  fullName: z.string().trim().min(2, "Enter the staff member's full name."),
  phone: z.string().trim().max(32).optional(),
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
  const parsed = inviteStaffSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
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

  if (!hasSupabaseConfig()) {
    return inviteDemoStaffMember(parsed.data);
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      status: "error",
      message: "Staff invites need SUPABASE_SERVICE_ROLE_KEY so MediLink can create tenant-linked auth users.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in to invite staff." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, tenant_id, role, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { status: "error", message: "Your user profile could not be found." };
  }

  if (profile.role !== "admin" && !profile.is_platform_admin) {
    return { status: "error", message: "Only the owner or an administrator can invite staff." };
  }

  const admin = createSupabaseAdminClient();
  const { data: tenant } = await admin
    .from("tenants")
    .select("tenant_kind")
    .eq("id", profile.tenant_id)
    .single();

  if (!isRoleAllowedForTenant(parsed.data.role, tenant?.tenant_kind)) {
    return {
      status: "error",
      message: "That role does not fit this business type.",
    };
  }

  const { data: existingUsers } = await admin
    .from("users")
    .select("id")
    .eq("tenant_id", profile.tenant_id)
    .ilike("email", parsed.data.email)
    .limit(1);

  if (existingUsers?.length) {
    return {
      status: "error",
      message: "That email is already a member of this workspace.",
    };
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: invitation, error: invitationError } = await admin
    .from("staff_invitations")
    .insert({
      tenant_id: profile.tenant_id,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      invited_by: user.id,
      expires_at: expiresAt,
      status: "pending",
    })
    .select("id")
    .single();

  if (invitationError || !invitation) {
    return {
      status: "error",
      message: invitationError?.message ?? "Unable to create the staff invitation.",
    };
  }

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      staff_invitation_id: invitation.id,
    },
    redirectTo: `${appConfig.siteUrl}/auth/callback?next=/dashboard`,
  });

  if (inviteError) {
    await admin.from("staff_invitations").delete().eq("id", invitation.id);

    return {
      status: "error",
      message: inviteError.message,
    };
  }

  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `${parsed.data.fullName} was invited as ${roleLabel(parsed.data.role)}.`,
  };
}

async function inviteDemoStaffMember(
  staff: z.infer<typeof inviteStaffSchema>,
): Promise<StaffInviteState> {
  const data = await getDashboardData();

  if (data.user.role !== "admin" && !data.user.is_platform_admin) {
    return { status: "error", message: "Only the owner or an administrator can invite staff." };
  }

  if (!isRoleAllowedForTenant(staff.role, data.tenant.tenant_kind)) {
    return { status: "error", message: "That role does not fit this business type." };
  }

  const workspaceId = await getCurrentDemoWorkspaceId();
  const now = new Date().toISOString();
  const invitation: StaffInvitation = {
    id: `local-invite-${crypto.randomUUID()}`,
    tenant_id: data.tenant.id,
    email: staff.email,
    full_name: staff.fullName,
    role: staff.role,
    phone: staff.phone || null,
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
    email: staff.email,
    full_name: staff.fullName,
    role: staff.role,
    phone: staff.phone || null,
    avatar_url: null,
    is_platform_admin: false,
    last_seen_at: null,
  };

  await saveLocalDemoStaffMember({ workspaceId, invitation, user });
  revalidatePath("/dashboard/staff");

  return {
    status: "success",
    message: `${staff.fullName} was added locally as ${roleLabel(staff.role)}.`,
  };
}

function isRoleAllowedForTenant(role: Exclude<UserRole, "patient">, tenantKind?: TenantKind) {
  if (tenantKind === "pharmacy") return role === "admin" || role === "pharmacist";
  if (tenantKind === "dentistry") return role === "admin" || role === "dentist" || role === "receptionist";
  if (role === "dentist") return false;

  return staffRoles.some((staffRole) => staffRole === role);
}

function roleLabel(role: Exclude<UserRole, "patient">) {
  const labels: Record<Exclude<UserRole, "patient">, string> = {
    admin: "Owner / Admin",
    dentist: "Dentist",
    doctor: "Doctor",
    pharmacist: "Pharmacist",
    receptionist: "Receptionist",
  };

  return labels[role];
}
