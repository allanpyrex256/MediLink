import { hasSupabaseConfig } from "@/lib/config";
import {
  platformMetrics as demoPlatformMetrics,
  platformTenants as demoPlatformTenants,
  revenueGrowth as demoRevenueGrowth,
  subscriptionStatus as demoSubscriptionStatus,
  tenantGrowth as demoTenantGrowth,
} from "@/lib/platform-demo";
import type { PlatformTenant } from "@/lib/platform-demo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TenantKind, TenantStatus } from "@/lib/types";

type PlatformMetrics = ReturnType<typeof demoPlatformMetrics>;
type RevenuePoint = (typeof demoRevenueGrowth)[number];
type TenantGrowthPoint = (typeof demoTenantGrowth)[number];
type SubscriptionStatusPoint = (typeof demoSubscriptionStatus)[number];

type TenantRow = {
  id: string;
  tenant_kind: TenantKind;
  name: string;
  legal_name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  status: TenantStatus;
  created_at: string;
};

type SubscriptionRow = {
  tenant_id: string;
  plan: "starter" | "growth" | "dental" | "enterprise";
  status: "trialing" | "active" | "past_due" | "cancelled";
  amount: number | string;
  current_period_start: string;
  current_period_end: string;
  provider: string | null;
  created_at: string;
};

type UserRow = {
  tenant_id: string;
};

export type PlatformOverview = {
  tenants: PlatformTenant[];
  metrics: PlatformMetrics;
  revenueGrowth: RevenuePoint[];
  subscriptionStatus: SubscriptionStatusPoint[];
  tenantGrowth: TenantGrowthPoint[];
  usingLiveData: boolean;
};

export async function getPlatformOverview(): Promise<PlatformOverview> {
  if (!hasSupabaseConfig()) return demoPlatformOverview();

  try {
    const supabase = await createSupabaseServerClient();
    const [tenantsResult, subscriptionsResult, usersResult] = await Promise.all([
      supabase
        .from("tenants")
        .select("id, tenant_kind, name, legal_name, region, address, phone, email, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("tenant_id, plan, status, amount, current_period_start, current_period_end, provider, created_at"),
      supabase.from("users").select("tenant_id"),
    ]);

    if (tenantsResult.error || !tenantsResult.data?.length) {
      return demoPlatformOverview();
    }

    return buildPlatformOverview({
      tenants: tenantsResult.data as TenantRow[],
      subscriptions: (subscriptionsResult.data ?? []) as SubscriptionRow[],
      users: (usersResult.data ?? []) as UserRow[],
    });
  } catch {
    return demoPlatformOverview();
  }
}

function demoPlatformOverview(): PlatformOverview {
  return {
    tenants: demoPlatformTenants,
    metrics: demoPlatformMetrics(),
    revenueGrowth: demoRevenueGrowth,
    subscriptionStatus: demoSubscriptionStatus,
    tenantGrowth: demoTenantGrowth,
    usingLiveData: false,
  };
}

function buildPlatformOverview({
  tenants,
  subscriptions,
  users,
}: {
  tenants: TenantRow[];
  subscriptions: SubscriptionRow[];
  users: UserRow[];
}): PlatformOverview {
  const subscriptionsByTenant = new Map(
    subscriptions.map((subscription) => [subscription.tenant_id, subscription]),
  );
  const usersByTenant = users.reduce<Record<string, number>>((counts, user) => {
    counts[user.tenant_id] = (counts[user.tenant_id] ?? 0) + 1;
    return counts;
  }, {});

  const platformTenants = tenants.map((tenant) => {
    const subscription = subscriptionsByTenant.get(tenant.id);
    const status = resolveTenantStatus(tenant.status, subscription?.status);

    return {
      id: tenant.id,
      business: tenant.name,
      kind: tenant.tenant_kind,
      plan: planLabel(subscription?.plan, tenant.tenant_kind),
      status,
      lastPayment: subscription?.status === "active" ? formatShortDate(subscription.current_period_start) : "Trial",
      nextDue: formatShortDate(subscription?.current_period_end),
      amount: Number(subscription?.amount ?? 0),
      region: tenant.region,
      users: usersByTenant[tenant.id] ?? 0,
      activity: activityForStatus(status),
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      paymentMethod: paymentMethodLabel(subscription?.provider, status),
    } satisfies PlatformTenant;
  });

  const metrics = buildMetrics(platformTenants, tenants);

  return {
    tenants: platformTenants,
    metrics,
    revenueGrowth: buildRevenueGrowth(platformTenants),
    subscriptionStatus: buildSubscriptionStatus(platformTenants),
    tenantGrowth: buildTenantGrowth(tenants),
    usingLiveData: true,
  };
}

function buildMetrics(tenants: PlatformTenant[], tenantRows: TenantRow[]): PlatformMetrics {
  const now = new Date();
  const monthlyRevenue = tenants
    .filter((tenant) => tenant.status === "active")
    .reduce((sum, tenant) => sum + tenant.amount, 0);

  return {
    activeClinics: tenants.filter((tenant) => tenant.kind === "clinic").length,
    activeTenants: tenants.filter((tenant) => tenant.status === "active").length,
    dentistry: tenants.filter((tenant) => tenant.kind === "dentistry").length,
    expiredAccounts: tenants.filter((tenant) => tenant.status === "past_due" || tenant.status === "disabled").length,
    monthlyRevenue,
    newSignups: tenantRows.filter((tenant) => isSameMonth(tenant.created_at, now)).length,
    pendingPayments: tenants.filter((tenant) => tenant.status !== "active" && tenant.amount > 0).length,
    pharmacies: tenants.filter((tenant) => tenant.kind === "pharmacy").length,
    totalHospitals: tenants.filter((tenant) => tenant.kind === "hospital").length,
    trialAccounts: tenants.filter((tenant) => tenant.status === "trialing").length,
  };
}

function buildRevenueGrowth(tenants: PlatformTenant[]): RevenuePoint[] {
  const currentRevenue = tenants
    .filter((tenant) => tenant.status === "active")
    .reduce((sum, tenant) => sum + tenant.amount, 0);
  const totalTenants = tenants.length;

  return monthLabels().map((month, index, months) => {
    const ratio = months.length === 1 ? 1 : (index + 1) / months.length;
    return {
      month,
      revenue: Math.round(currentRevenue * ratio),
      tenants: Math.max(0, Math.round(totalTenants * ratio)),
    };
  });
}

function buildTenantGrowth(tenants: TenantRow[]): TenantGrowthPoint[] {
  return monthLabels().map((month, index) => {
    const monthDate = monthDateAt(index);
    const rows = tenants.filter((tenant) => new Date(tenant.created_at) <= monthDate);

    return {
      month,
      hospitals: rows.filter((tenant) => tenant.tenant_kind === "hospital").length,
      clinics: rows.filter((tenant) => tenant.tenant_kind === "clinic").length,
      dentistry: rows.filter((tenant) => tenant.tenant_kind === "dentistry").length,
      pharmacies: rows.filter((tenant) => tenant.tenant_kind === "pharmacy").length,
    };
  });
}

function buildSubscriptionStatus(tenants: PlatformTenant[]): SubscriptionStatusPoint[] {
  const active = tenants.filter((tenant) => tenant.status === "active").length;
  const trial = tenants.filter((tenant) => tenant.status === "trialing").length;
  const expired = tenants.filter((tenant) => tenant.status === "past_due" || tenant.status === "disabled").length;

  return [
    { name: "Active", value: active, color: "#10b981" },
    { name: "Trial", value: trial, color: "#3b82f6" },
    { name: "Expired", value: expired, color: "#f59e0b" },
  ];
}

function resolveTenantStatus(
  tenantStatus: TenantStatus,
  subscriptionStatus?: SubscriptionRow["status"],
): TenantStatus {
  if (tenantStatus === "disabled" || subscriptionStatus === "cancelled") return "disabled";
  if (tenantStatus === "past_due" || subscriptionStatus === "past_due") return "past_due";
  if (tenantStatus === "active" || subscriptionStatus === "active") return "active";
  return "trialing";
}

function planLabel(plan?: SubscriptionRow["plan"], kind?: TenantKind): PlatformTenant["plan"] {
  if (plan === "dental") return "Dental";
  if (kind === "dentistry") return "Dental";
  if (plan === "enterprise") return "Hospital";
  if (plan === "growth") return "Clinic";
  return "Starter";
}

function paymentMethodLabel(
  provider: string | null | undefined,
  status: TenantStatus,
): PlatformTenant["paymentMethod"] {
  if (provider === "mtn_momo") return "MTN MoMo";
  if (provider === "airtel_money") return "Airtel Money";
  if (provider === "bank_transfer") return "Bank Transfer";
  if (provider === "stripe") return "Mastercard";
  if (status === "trialing") return "Trial";
  return "Bank Transfer";
}

function activityForStatus(status: TenantStatus): PlatformTenant["activity"] {
  if (status === "active") return "active";
  if (status === "trialing") return "quiet";
  return "inactive";
}

function formatShortDate(value: string | null | undefined) {
  if (!value) return "Pending";

  return new Intl.DateTimeFormat("en-UG", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function isSameMonth(value: string, date: Date) {
  const candidate = new Date(value);
  return candidate.getFullYear() === date.getFullYear() && candidate.getMonth() === date.getMonth();
}

function monthLabels() {
  return Array.from({ length: 6 }, (_, index) =>
    new Intl.DateTimeFormat("en-UG", { month: "short" }).format(monthDateAt(index)),
  );
}

function monthDateAt(index: number) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
  date.setHours(23, 59, 59, 999);
  return date;
}
