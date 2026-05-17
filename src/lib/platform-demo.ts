import type { TenantKind, TenantStatus } from "@/lib/types";

export type PlatformTenant = {
  id: string;
  business: string;
  kind: TenantKind;
  plan: "Starter" | "Pro" | "Premium" | "Enterprise";
  status: TenantStatus;
  lastPayment: string;
  nextDue: string;
  amount: number;
  region: string;
  users: number;
  activity: "active" | "quiet" | "inactive";
};

export type SupportTicket = {
  id: string;
  business: string;
  title: string;
  priority: "low" | "medium" | "high";
  status: "open" | "waiting" | "resolved";
  updatedAt: string;
};

export const platformTenants: PlatformTenant[] = [
  {
    id: "tenant-1",
    business: "Kampala Care",
    kind: "hospital",
    plan: "Premium",
    status: "active",
    lastPayment: "May 2",
    nextDue: "Jun 2",
    amount: 450000,
    region: "Kampala",
    users: 42,
    activity: "active",
  },
  {
    id: "tenant-2",
    business: "Mulago Clinic",
    kind: "clinic",
    plan: "Starter",
    status: "past_due",
    lastPayment: "Apr 10",
    nextDue: "May 10",
    amount: 120000,
    region: "Kampala",
    users: 9,
    activity: "inactive",
  },
  {
    id: "tenant-3",
    business: "Acacia Care Pharmacy",
    kind: "pharmacy",
    plan: "Pro",
    status: "active",
    lastPayment: "May 9",
    nextDue: "Jun 9",
    amount: 240000,
    region: "Kampala",
    users: 13,
    activity: "active",
  },
  {
    id: "tenant-4",
    business: "Jinja Children Hospital",
    kind: "hospital",
    plan: "Enterprise",
    status: "active",
    lastPayment: "May 1",
    nextDue: "Jun 1",
    amount: 780000,
    region: "Jinja",
    users: 58,
    activity: "active",
  },
  {
    id: "tenant-5",
    business: "Nairobi East Medical Centre",
    kind: "clinic",
    plan: "Pro",
    status: "past_due",
    lastPayment: "Apr 18",
    nextDue: "May 18",
    amount: 260000,
    region: "Nairobi",
    users: 21,
    activity: "quiet",
  },
  {
    id: "tenant-6",
    business: "Mbarara Family Clinic",
    kind: "clinic",
    plan: "Starter",
    status: "trialing",
    lastPayment: "Trial",
    nextDue: "May 28",
    amount: 0,
    region: "Mbarara",
    users: 5,
    activity: "active",
  },
  {
    id: "tenant-7",
    business: "Ntinda Wellness Pharmacy",
    kind: "pharmacy",
    plan: "Starter",
    status: "trialing",
    lastPayment: "Trial",
    nextDue: "May 30",
    amount: 0,
    region: "Kampala",
    users: 4,
    activity: "quiet",
  },
];

export const revenueGrowth = [
  { month: "Jan", revenue: 5600000, tenants: 15 },
  { month: "Feb", revenue: 6800000, tenants: 18 },
  { month: "Mar", revenue: 7900000, tenants: 21 },
  { month: "Apr", revenue: 9300000, tenants: 24 },
  { month: "May", revenue: 12400000, tenants: 31 },
  { month: "Jun", revenue: 13900000, tenants: 36 },
];

export const tenantGrowth = [
  { month: "Jan", hospitals: 12, clinics: 9, pharmacies: 4 },
  { month: "Feb", hospitals: 14, clinics: 11, pharmacies: 5 },
  { month: "Mar", hospitals: 17, clinics: 13, pharmacies: 6 },
  { month: "Apr", hospitals: 20, clinics: 15, pharmacies: 8 },
  { month: "May", hospitals: 24, clinics: 18, pharmacies: 9 },
  { month: "Jun", hospitals: 28, clinics: 21, pharmacies: 12 },
];

export const subscriptionStatus = [
  { name: "Active", value: 27, color: "#10b981" },
  { name: "Trial", value: 7, color: "#3b82f6" },
  { name: "Expired", value: 3, color: "#f59e0b" },
];

export const subscriptionPlans = [
  {
    name: "Starter",
    price: 120000,
    tenants: 11,
    features: "Appointments, patients, billing, basic reports",
  },
  {
    name: "Pro",
    price: 240000,
    tenants: 13,
    features: "Pharmacy, labs, WhatsApp reminders, analytics",
  },
  {
    name: "Enterprise",
    price: 780000,
    tenants: 5,
    features: "Multi-branch, API access, priority support",
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "SUP-1041",
    business: "Kampala Care",
    title: "Need help adding a second branch",
    priority: "medium",
    status: "open",
    updatedAt: "Today, 09:20",
  },
  {
    id: "SUP-1038",
    business: "Mulago Clinic",
    title: "Subscription renewal payment failed",
    priority: "high",
    status: "waiting",
    updatedAt: "Yesterday, 16:12",
  },
  {
    id: "SUP-1033",
    business: "Acacia Care Pharmacy",
    title: "Inventory import template question",
    priority: "low",
    status: "resolved",
    updatedAt: "May 14, 11:45",
  },
];

export function platformMetrics() {
  const totalHospitals = 24;
  const activeClinics = 18;
  const pharmacies = 9;
  const monthlyRevenue = 12_400_000;
  const expiredAccounts = 3;
  const newSignups = 7;
  const activeTenants = 27;
  const pendingPayments = 5;
  const trialAccounts = 7;

  return {
    activeClinics,
    activeTenants,
    expiredAccounts,
    monthlyRevenue,
    newSignups,
    pendingPayments,
    pharmacies,
    totalHospitals,
    trialAccounts,
  };
}
