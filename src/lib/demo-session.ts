import type { Tenant, TenantKind, UserRole } from "@/lib/types";

export const DEMO_WORKSPACE_COOKIE = "medilink_demo_workspace";
export const DEMO_ACCOUNT_COOKIE = "medilink_demo_account";

export type DemoWorkspaceId =
  | "kampala-family-clinic"
  | "jinja-children-hospital"
  | "acacia-care-pharmacy";

export const defaultDemoWorkspaceId: DemoWorkspaceId = "kampala-family-clinic";

export const demoWorkspaceOptions: {
  id: DemoWorkspaceId;
  name: string;
  kind: TenantKind;
  email: string;
  description: string;
}[] = [
  {
    id: "kampala-family-clinic",
    name: "Kampala Care Hospital",
    kind: "hospital",
    email: "admin@kampalacarehospital.ug",
    description: "Hospital admin portal",
  },
  {
    id: "jinja-children-hospital",
    name: "Jinja Children Hospital",
    kind: "hospital",
    email: "admin@jinjachildren.ug",
    description: "Hospital operations portal",
  },
  {
    id: "acacia-care-pharmacy",
    name: "Acacia Care Pharmacy",
    kind: "pharmacy",
    email: "manager@acaciacarepharmacy.ug",
    description: "Pharmacy stock and dispensing portal",
  },
];

export const demoWorkspaceAliases: Record<string, DemoWorkspaceId> = {
  "kampala-family-clinic": "kampala-family-clinic",
  "kampala-care-hospital": "kampala-family-clinic",
  "kampala-care": "kampala-family-clinic",
  kampalacare: "kampala-family-clinic",
  kampalaclinic: "kampala-family-clinic",
  kampala: "kampala-family-clinic",
  "jinja-children-hospital": "jinja-children-hospital",
  "jinja-children": "jinja-children-hospital",
  citycare: "jinja-children-hospital",
  "acacia-care-pharmacy": "acacia-care-pharmacy",
  acaciacare: "acacia-care-pharmacy",
  mediplus: "acacia-care-pharmacy",
};

export const demoTenantProfiles: Record<
  string,
  {
    workspaceId: DemoWorkspaceId;
    tenant: Partial<
      Pick<Tenant, "name" | "slug" | "legal_name" | "email" | "subdomain" | "tenant_kind">
    >;
  }
> = {
  kampalaclinic: {
    workspaceId: "kampala-family-clinic",
    tenant: {
      name: "Kampala Care Hospital",
      slug: "kampalaclinic",
      legal_name: "Kampala Care Hospital Ltd",
      email: "admin@kampalacarehospital.ug",
      subdomain: "kampalaclinic",
      tenant_kind: "hospital",
    },
  },
  kampalacare: {
    workspaceId: "kampala-family-clinic",
    tenant: {
      name: "Kampala Care Hospital",
      slug: "kampala-care-hospital",
      legal_name: "Kampala Care Hospital Ltd",
      email: "admin@kampalacarehospital.ug",
      subdomain: "kampala-care-hospital",
      tenant_kind: "hospital",
    },
  },
  "kampala-care-hospital": {
    workspaceId: "kampala-family-clinic",
    tenant: {
      name: "Kampala Care Hospital",
      slug: "kampala-care-hospital",
      legal_name: "Kampala Care Hospital Ltd",
      email: "admin@kampalacarehospital.ug",
      subdomain: "kampala-care-hospital",
      tenant_kind: "hospital",
    },
  },
  citycare: {
    workspaceId: "jinja-children-hospital",
    tenant: {
      name: "CityCare Hospital",
      slug: "citycare",
      legal_name: "CityCare Hospital Ltd",
      email: "admin@citycare.com",
      subdomain: "citycare",
      tenant_kind: "hospital",
    },
  },
  mediplus: {
    workspaceId: "acacia-care-pharmacy",
    tenant: {
      name: "MediPlus Pharmacy",
      slug: "mediplus",
      legal_name: "MediPlus Pharmacy Ltd",
      email: "pharmacist@mediplus.com",
      subdomain: "mediplus",
      tenant_kind: "pharmacy",
    },
  },
};

export const demoAccountOptions: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  workspaceId: DemoWorkspaceId;
  description: string;
  isPlatformAdmin?: boolean;
}[] = [
  {
    email: "owner@medilink.test",
    password: "demo12345",
    fullName: "MediLink Super Admin",
    role: "admin",
    workspaceId: "kampala-family-clinic",
    description: "Super Admin - platform control",
    isPlatformAdmin: true,
  },
  {
    email: "admin@kampalacarehospital.ug",
    password: "demo12345",
    fullName: "Kampala Care Hospital Admin",
    role: "admin",
    workspaceId: "kampala-family-clinic",
    description: "Hospital Admin - full clinic management",
  },
  {
    email: "doctor@kampalacarehospital.ug",
    password: "demo12345",
    fullName: "Dr. Sarah Namusoke",
    role: "doctor",
    workspaceId: "kampala-family-clinic",
    description: "Doctor - patient records",
  },
  {
    email: "reception@kampalacarehospital.ug",
    password: "demo12345",
    fullName: "Kampala Care Front Desk",
    role: "receptionist",
    workspaceId: "kampala-family-clinic",
    description: "Receptionist - appointments",
  },
  {
    email: "admin@citycare.com",
    password: "demo12345",
    fullName: "CityCare Clinic Admin",
    role: "admin",
    workspaceId: "jinja-children-hospital",
    description: "Admin - hospital operations tenant",
  },
  {
    email: "pharmacist@mediplus.com",
    password: "demo12345",
    fullName: "MediPlus Pharmacist",
    role: "pharmacist",
    workspaceId: "acacia-care-pharmacy",
    description: "Pharmacist - handles medicine and stock",
  },
  {
    email: "patient@kampalacarehospital.ug",
    password: "demo12345",
    fullName: "John Doe",
    role: "patient",
    workspaceId: "kampala-family-clinic",
    description: "Patient - books appointments",
  },
];

export function isDemoWorkspaceId(value: string | null | undefined): value is DemoWorkspaceId {
  return demoWorkspaceOptions.some((workspace) => workspace.id === value);
}

export function normalizeDemoWorkspaceId(value: string | null | undefined): DemoWorkspaceId {
  return isDemoWorkspaceId(value) ? value : defaultDemoWorkspaceId;
}

export function normalizeDemoSlug(value: string | null | undefined) {
  return value?.toLowerCase().trim().replace(/_/g, "-") ?? "";
}

export function demoWorkspaceIdForSlug(value: string | null | undefined): DemoWorkspaceId | null {
  return demoWorkspaceAliases[normalizeDemoSlug(value)] ?? null;
}

export function demoTenantProfileForSlug(value: string | null | undefined) {
  return demoTenantProfiles[normalizeDemoSlug(value)] ?? null;
}

export function demoAccountForEmail(value: string | null | undefined) {
  const normalized = value?.toLowerCase().trim();
  return demoAccountOptions.find((account) => account.email === normalized) ?? null;
}
