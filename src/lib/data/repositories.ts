import { cookies, headers } from "next/headers";
import { hasSupabaseConfig } from "@/lib/config";
import { buildDemoDashboardData, demoPlatformTenants, demoUser } from "@/lib/demo-data";
import {
  DEMO_ACCOUNT_COOKIE,
  DEMO_WORKSPACE_COOKIE,
  demoAccountOptions,
  demoAccountForEmail,
  demoTenantProfileForSlug,
  demoWorkspaceIdForSlug,
  normalizeDemoWorkspaceId,
} from "@/lib/demo-session";
import {
  getLocalDemoDocumentTemplates,
  getLocalDemoStaffDirectory,
  hydrateLocalDemoDashboardData,
} from "@/lib/local-demo-store";
import { tenantSlugFromHost } from "@/lib/tenant-host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AppUser,
  Appointment,
  Branch,
  ClinicalPrescription,
  DashboardData,
  Diagnosis,
  Doctor,
  Invoice,
  InventoryItem,
  LabResult,
  Patient,
  Payment,
  PrescriptionOrder,
  StaffInvitation,
  Tenant,
  TenantDocumentTemplate,
  TenantStaffUser,
  VisitRecord,
} from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

async function getDemoDashboardData() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const hostSlug = tenantSlugFromHost(headerStore.get("host"));
  const hostWorkspaceId = demoWorkspaceIdForSlug(hostSlug);
  const tenantProfile = demoTenantProfileForSlug(hostSlug);
  const workspaceId =
    hostWorkspaceId ??
    normalizeDemoWorkspaceId(cookieStore.get(DEMO_WORKSPACE_COOKIE)?.value);
  const demoAccount = demoAccountForEmail(cookieStore.get(DEMO_ACCOUNT_COOKIE)?.value);
  const hydratedData = await hydrateLocalDemoDashboardData(
    buildDemoDashboardData(workspaceId),
    workspaceId,
  );
  const data =
    tenantProfile?.workspaceId === workspaceId
      ? {
          ...hydratedData,
          tenant: {
            ...hydratedData.tenant,
            ...tenantProfile.tenant,
          },
        }
      : hydratedData;

  if (!demoAccount || demoAccount.workspaceId !== workspaceId) return data;

  return {
    ...data,
    user: {
      ...data.user,
      email: demoAccount.email,
      full_name: demoAccount.fullName,
      role: demoAccount.role,
      is_platform_admin: demoAccount.isPlatformAdmin ?? false,
    },
  };
}

export async function getCurrentDemoWorkspaceId() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const hostSlug = tenantSlugFromHost(headerStore.get("host"));
  const hostWorkspaceId = demoWorkspaceIdForSlug(hostSlug);

  return (
    hostWorkspaceId ??
    normalizeDemoWorkspaceId(cookieStore.get(DEMO_WORKSPACE_COOKIE)?.value)
  );
}

export async function getCurrentProfile(): Promise<AppUser> {
  if (!hasSupabaseConfig()) {
    return (await getDemoDashboardData()).user;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return demoUser;

    const { data } = await supabase
      .from("users")
      .select(
        "id, tenant_id, email, full_name, role, phone, avatar_url, is_platform_admin, last_seen_at",
      )
      .eq("id", user.id)
      .single();

    return (data as AppUser | null) ?? demoUser;
  } catch {
    return demoUser;
  }
}

export async function getTenantStaffDirectory(): Promise<{
  invitations: StaffInvitation[];
  users: TenantStaffUser[];
}> {
  if (!hasSupabaseConfig()) {
    const workspaceId = await getCurrentDemoWorkspaceId();
    const dashboardData = await getDemoDashboardData();
    const local = await getLocalDemoStaffDirectory(workspaceId);
    const baseUsers = demoAccountOptions
      .filter((account) => account.workspaceId === workspaceId && !account.isPlatformAdmin)
      .map<TenantStaffUser>((account) => ({
        id: `demo-user-${account.email}`,
        tenant_id: dashboardData.tenant.id,
        email: account.email,
        full_name: account.fullName,
        role: account.role,
        phone: null,
        avatar_url: null,
        is_platform_admin: false,
        last_seen_at: null,
        created_at: dashboardData.tenant.created_at,
      }));
    const usersByEmail = new Map<string, TenantStaffUser>();

    for (const user of baseUsers) usersByEmail.set(user.email.toLowerCase(), user);
    for (const user of local.users) {
      usersByEmail.set(user.email.toLowerCase(), {
        ...user,
        created_at: dashboardData.tenant.created_at,
      });
    }

    return {
      invitations: local.invitations,
      users: Array.from(usersByEmail.values()),
    };
  }

  const supabase = await createSupabaseServerClient();
  const profile = await getCurrentProfile();

  const { data: users } = await supabase
    .from("users")
    .select("id, tenant_id, email, full_name, role, phone, avatar_url, is_platform_admin, last_seen_at, created_at, updated_at")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: true });

  const { data: invitations } = await supabase
    .from("staff_invitations")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false });

  return {
    invitations: (invitations ?? []) as StaffInvitation[],
    users: (users ?? []) as TenantStaffUser[],
  };
}

export async function getTenantDocumentTemplates(): Promise<TenantDocumentTemplate[]> {
  if (!hasSupabaseConfig()) {
    const workspaceId = await getCurrentDemoWorkspaceId();
    return getLocalDemoDocumentTemplates(workspaceId);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const profile = await getCurrentProfile();

    const { data } = await supabase
      .from("document_templates")
      .select("*")
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false });

    return (data ?? []) as TenantDocumentTemplate[];
  } catch {
    return [];
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasSupabaseConfig()) {
    return getDemoDashboardData();
  }

  try {
    const supabase = await createSupabaseServerClient();
    const profile = await getCurrentProfile();
    const tenantId = profile.tenant_id;

    const { data: tenant } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    const { data: doctors } = await supabase
      .from("doctors")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("full_name");

    const { data: patients } = await supabase
      .from("patients")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: appointments } = await supabase
      .from("appointments")
      .select("*, doctor:doctors(*), patient:patients(*)")
      .eq("tenant_id", tenantId)
      .order("scheduled_at", { ascending: true })
      .limit(30);

    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: notifications } = await supabase
      .from("notifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    const { data: diagnoses } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("diagnosed_at", { ascending: false });

    const { data: clinicalPrescriptions } = await supabase
      .from("clinical_prescriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("prescribed_at", { ascending: false });

    const { data: labResults } = await supabase
      .from("lab_results")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("requested_at", { ascending: false });

    const { data: visitRecords } = await supabase
      .from("visit_records")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("visited_at", { ascending: false });

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    const { data: branches } = await supabase
      .from("branches")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");

    const { data: inventory } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");

    const { data: prescriptions } = await supabase
      .from("prescription_orders")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    const normalizedDoctors = (doctors ?? []) as Doctor[];
    const normalizedPatients = (patients ?? []) as Patient[];
    const normalizedAppointments = (appointments ?? []) as Appointment[];
    const normalizedPayments = (payments ?? []) as Payment[];
    const normalizedDiagnoses = (diagnoses ?? []) as Diagnosis[];
    const normalizedClinicalPrescriptions = (clinicalPrescriptions ?? []) as ClinicalPrescription[];
    const normalizedLabResults = (labResults ?? []) as LabResult[];
    const normalizedVisitRecords = (visitRecords ?? []) as VisitRecord[];
    const normalizedInvoices = (invoices ?? []) as Invoice[];
    const normalizedBranches = (branches ?? []) as Branch[];
    const normalizedInventory = (inventory ?? []) as InventoryItem[];
    const normalizedPrescriptions = (prescriptions ?? []) as PrescriptionOrder[];
    const paidRevenue = normalizedPayments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const availableDoctors = normalizedDoctors.filter(
      (doctor) => doctor.status === "available",
    ).length;
    const fallbackData = buildDemoDashboardData();
    const normalizedTenant = (tenant as Tenant | null) ?? fallbackData.tenant;
    const isPharmacy = normalizedTenant.tenant_kind === "pharmacy";
    const prescriptionAppointments: Appointment[] = normalizedPrescriptions.map((prescription) => ({
      id: `rx-${prescription.id}`,
      tenant_id: tenantId,
      doctor_id: prescription.id,
      patient_id: prescription.id,
      scheduled_at: prescription.fulfillment_due,
      duration_minutes: 15,
      status: prescription.status === "collected" ? "completed" : "pending",
      reason: `Prescription order: ${prescription.medicine}`,
      notes: prescription.prescriber,
      fee: Number(prescription.total_amount),
      payment_status: prescription.status === "collected" ? "paid" : "pending",
      created_at: prescription.created_at,
      patient: {
        id: prescription.id,
        tenant_id: tenantId,
        user_id: null,
        full_name: prescription.patient_name,
        date_of_birth: null,
        sex: "other",
        phone: "+256700000000",
        email: null,
        national_id: null,
        medical_history: [],
        allergies: [],
        emergency_contact: null,
        created_at: prescription.created_at,
      },
    }));
    const effectiveInventory = normalizedInventory.length ? normalizedInventory : fallbackData.inventory;
    const effectivePrescriptions = normalizedPrescriptions.length
      ? normalizedPrescriptions
      : fallbackData.prescriptions;

    return {
      ...fallbackData,
      tenant: normalizedTenant,
      user: profile,
      doctors: normalizedDoctors.length
        ? normalizedDoctors
        : fallbackData.doctors,
      patients: normalizedPatients.length
        ? normalizedPatients
        : fallbackData.patients,
      appointments: isPharmacy && prescriptionAppointments.length
        ? prescriptionAppointments
        : normalizedAppointments.length
        ? normalizedAppointments
        : fallbackData.appointments,
      payments: normalizedPayments.length
        ? normalizedPayments
        : fallbackData.payments,
      notifications: notifications?.length
        ? fallbackData.notifications.map((item, index) => ({
            ...item,
            ...(notifications[index] ?? {}),
          }))
        : fallbackData.notifications,
      subscriptions: subscriptions?.length
        ? fallbackData.subscriptions.map((item, index) => ({
            ...item,
            ...(subscriptions[index] ?? {}),
          }))
        : fallbackData.subscriptions,
      diagnoses: normalizedDiagnoses.length
        ? normalizedDiagnoses
        : fallbackData.diagnoses,
      clinicalPrescriptions: normalizedClinicalPrescriptions.length
        ? normalizedClinicalPrescriptions
        : fallbackData.clinicalPrescriptions,
      labResults: normalizedLabResults.length
        ? normalizedLabResults
        : fallbackData.labResults,
      visitRecords: normalizedVisitRecords.length
        ? normalizedVisitRecords
        : fallbackData.visitRecords,
      invoices: normalizedInvoices.length
        ? normalizedInvoices
        : fallbackData.invoices,
      branches: normalizedBranches.length
        ? normalizedBranches
        : fallbackData.branches,
      inventory: effectiveInventory,
      prescriptions: effectivePrescriptions,
      metrics: isPharmacy
        ? [
            {
              label: "Active prescriptions",
              value: String(effectivePrescriptions.filter((item) => item.status !== "collected").length),
              change: "Live from Supabase",
              tone: "blue",
            },
            {
              label: "Low stock items",
              value: String(
                effectiveInventory.filter((item) =>
                  ["low_stock", "out_of_stock", "expiring"].includes(item.status),
                ).length,
              ),
              change: "Needs reorder",
              tone: "amber",
            },
            {
              label: "Collected sales",
              value: formatUgandanCurrency(paidRevenue),
              change: "Paid transactions only",
              tone: "green",
            },
            {
              label: "Ready pickups",
              value: String(effectivePrescriptions.filter((item) => item.status === "ready").length),
              change: "Customer notification ready",
              tone: "rose",
            },
          ]
        : [
            {
              label: "Total patients",
              value: String(normalizedPatients.length || 0),
              change: "Protected by tenant RLS",
              tone: "blue",
            },
            {
              label: "Appointments today",
              value: String(normalizedAppointments.length || 0),
              change: "Live from Supabase",
              tone: "green",
            },
            {
              label: "Collected revenue",
              value: formatUgandanCurrency(paidRevenue),
              change: "Paid transactions only",
              tone: "amber",
            },
            {
              label: "Doctor availability",
              value: `${availableDoctors}/${normalizedDoctors.length || 0}`,
              change: "Realtime-ready status",
              tone: "rose",
            },
          ],
    };
  } catch {
    return buildDemoDashboardData();
  }
}

export async function getPlatformTenants(): Promise<Tenant[]> {
  if (!hasSupabaseConfig()) {
    return demoPlatformTenants;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });

    return data?.length ? (data as Tenant[]) : demoPlatformTenants;
  } catch {
    return demoPlatformTenants;
  }
}
