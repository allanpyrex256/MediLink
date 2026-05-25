import { hasSupabaseAdminConfig, isDemoModeAllowed } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { demoTenantProfileForSlug, demoWorkspaceIdForSlug } from "@/lib/demo-session";
import { hydrateLocalDemoDashboardData } from "@/lib/local-demo-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Appointment, Doctor, Tenant } from "@/lib/types";

export { demoWorkspaceIdForSlug } from "@/lib/demo-session";

export interface PublicBookingData {
  tenant: Tenant;
  doctors: Doctor[];
  bookedAppointments: Appointment[];
}

export function normalizePublicBookingSlug(value: string) {
  return value.toLowerCase().trim();
}

export async function getPublicBookingData(slug: string): Promise<PublicBookingData | null> {
  const normalized = normalizePublicBookingSlug(slug);
  const demoWorkspaceId = demoWorkspaceIdForSlug(normalized);

  if (!hasSupabaseAdminConfig()) {
    if (!isDemoModeAllowed()) return null;

    if (!demoWorkspaceId) return null;

    const data = await hydrateLocalDemoDashboardData(
      buildDemoDashboardData(demoWorkspaceId),
      demoWorkspaceId,
    );
    const profile = demoTenantProfileForSlug(normalized);
    const tenant =
      profile?.workspaceId === demoWorkspaceId
        ? {
            ...data.tenant,
            ...profile.tenant,
          }
        : data.tenant;

    if (tenant.tenant_kind === "pharmacy") return null;

    return {
      tenant,
      doctors: data.doctors.filter((doctor) => doctor.status !== "offline"),
      bookedAppointments: data.appointments.filter((appointment) =>
        ["pending", "confirmed"].includes(appointment.status),
      ),
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: tenants, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .in("tenant_kind", ["clinic", "hospital", "dentistry"])
    .or(`slug.eq.${normalized},subdomain.eq.${normalized}`)
    .limit(1);

  if (tenantError || !tenants?.[0]) return null;

  const tenant = tenants[0] as Tenant;
  const { data: doctors } = await supabase
    .from("doctors")
    .select("*")
    .eq("tenant_id", tenant.id)
    .neq("status", "offline")
    .order("full_name");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, tenant_id, doctor_id, patient_id, scheduled_at, duration_minutes, status, reason, notes, fee, payment_status, created_at")
    .eq("tenant_id", tenant.id)
    .in("status", ["pending", "confirmed"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(120);

  return {
    tenant,
    doctors: (doctors ?? []) as Doctor[],
    bookedAppointments: (appointments ?? []) as Appointment[],
  };
}
