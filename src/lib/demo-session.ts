import type { Tenant, TenantKind, UserRole } from "@/lib/types";

export const DEMO_WORKSPACE_COOKIE = "medilink_demo_workspace";
export const DEMO_ACCOUNT_COOKIE = "medilink_demo_account";

export type DemoWorkspaceId =
  | "kampala-hospital"
  | "mengo-clinic"
  | "mukono-medical-centre"
  | "vine-pharmacy"
  | "goodlife-pharmacy";

export const defaultDemoWorkspaceId: DemoWorkspaceId = "kampala-hospital";

export const demoWorkspaceOptions: {
  id: DemoWorkspaceId;
  name: string;
  kind: TenantKind;
  email: string;
  description: string;
}[] = [
  {
    id: "kampala-hospital",
    name: "Kampala Hospital",
    kind: "hospital",
    email: "admin@kampalahospital.ug",
    description: "Hospital Administrator - Operations & Staff Control",
  },
  {
    id: "mengo-clinic",
    name: "Mengo Clinic",
    kind: "clinic",
    email: "manager@mengoclinic.ug",
    description: "Clinic Manager - Branch & Patient Flow",
  },
  {
    id: "mukono-medical-centre",
    name: "Mukono Medical Centre",
    kind: "clinic",
    email: "admin@mukonomedical.ug",
    description: "Medical Center Admin - Departments & Billing",
  },
  {
    id: "vine-pharmacy",
    name: "Vine Pharmacy",
    kind: "pharmacy",
    email: "pharmacy@vinepharmacy.ug",
    description: "Pharmacy Manager - Stock & Dispensing Control",
  },
  {
    id: "goodlife-pharmacy",
    name: "GoodLife Pharmacy",
    kind: "pharmacy",
    email: "manager@goodlifepharmacy.ug",
    description: "Branch Pharmacist - Inventory & Refills",
  },
];

export const demoWorkspaceBranding: Record<
  DemoWorkspaceId,
  {
    name: string;
    initials: string;
    primaryColor: string;
    accentColor: string;
    tagline: string;
  }
> = {
  "kampala-hospital": {
    name: "Kampala Hospital",
    initials: "KH",
    primaryColor: "#6d28d9",
    accentColor: "#0ea5e9",
    tagline: "Daily hospital operations",
  },
  "mengo-clinic": {
    name: "Mengo Clinic",
    initials: "MC",
    primaryColor: "#0f6fdc",
    accentColor: "#14b8a6",
    tagline: "Outpatient clinic operations",
  },
  "mukono-medical-centre": {
    name: "Mukono Medical Centre",
    initials: "MM",
    primaryColor: "#047857",
    accentColor: "#0ea5e9",
    tagline: "Medical centre management",
  },
  "vine-pharmacy": {
    name: "Vine Pharmacy",
    initials: "VP",
    primaryColor: "#047857",
    accentColor: "#f59e0b",
    tagline: "Pharmacy POS and stock control",
  },
  "goodlife-pharmacy": {
    name: "GoodLife Pharmacy",
    initials: "GP",
    primaryColor: "#0f766e",
    accentColor: "#7c3aed",
    tagline: "Branch pharmacy operations",
  },
};

export const demoWorkspaceAliases: Record<string, DemoWorkspaceId> = {
  "kampala-hospital": "kampala-hospital",
  kampalahospital: "kampala-hospital",
  "kampala-family-clinic": "kampala-hospital",
  "kampala-care-hospital": "kampala-hospital",
  "kampala-care": "kampala-hospital",
  kampalacare: "kampala-hospital",
  kampalaclinic: "kampala-hospital",
  kampala: "kampala-hospital",
  "mengo-clinic": "mengo-clinic",
  mengoclinic: "mengo-clinic",
  mengo: "mengo-clinic",
  "jinja-children-hospital": "mengo-clinic",
  "jinja-children": "mengo-clinic",
  citycare: "mengo-clinic",
  "mukono-medical-centre": "mukono-medical-centre",
  "mukono-medical-center": "mukono-medical-centre",
  mukonomedical: "mukono-medical-centre",
  mukono: "mukono-medical-centre",
  "vine-pharmacy": "vine-pharmacy",
  vinepharmacy: "vine-pharmacy",
  "acacia-care-pharmacy": "vine-pharmacy",
  acaciacare: "vine-pharmacy",
  "goodlife-pharmacy": "goodlife-pharmacy",
  goodlifepharmacy: "goodlife-pharmacy",
  mediplus: "goodlife-pharmacy",
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
  "kampala-hospital": {
    workspaceId: "kampala-hospital",
    tenant: {
      name: "Kampala Hospital",
      slug: "kampala-hospital",
      legal_name: "Kampala Hospital Ltd",
      email: "admin@kampalahospital.ug",
      subdomain: "kampala-hospital",
      tenant_kind: "hospital",
    },
  },
  kampalahospital: {
    workspaceId: "kampala-hospital",
    tenant: {
      name: "Kampala Hospital",
      slug: "kampala-hospital",
      legal_name: "Kampala Hospital Ltd",
      email: "admin@kampalahospital.ug",
      subdomain: "kampala-hospital",
      tenant_kind: "hospital",
    },
  },
  "kampala-care-hospital": {
    workspaceId: "kampala-hospital",
    tenant: {
      name: "Kampala Hospital",
      slug: "kampala-hospital",
      legal_name: "Kampala Hospital Ltd",
      email: "admin@kampalahospital.ug",
      subdomain: "kampala-hospital",
      tenant_kind: "hospital",
    },
  },
  kampalaclinic: {
    workspaceId: "kampala-hospital",
    tenant: {
      name: "Kampala Hospital",
      slug: "kampala-hospital",
      legal_name: "Kampala Hospital Ltd",
      email: "admin@kampalahospital.ug",
      subdomain: "kampala-hospital",
      tenant_kind: "hospital",
    },
  },
  "mengo-clinic": {
    workspaceId: "mengo-clinic",
    tenant: {
      name: "Mengo Clinic",
      slug: "mengo-clinic",
      legal_name: "Mengo Clinic Ltd",
      email: "manager@mengoclinic.ug",
      subdomain: "mengo-clinic",
      tenant_kind: "clinic",
    },
  },
  mengoclinic: {
    workspaceId: "mengo-clinic",
    tenant: {
      name: "Mengo Clinic",
      slug: "mengo-clinic",
      legal_name: "Mengo Clinic Ltd",
      email: "manager@mengoclinic.ug",
      subdomain: "mengo-clinic",
      tenant_kind: "clinic",
    },
  },
  citycare: {
    workspaceId: "mengo-clinic",
    tenant: {
      name: "Mengo Clinic",
      slug: "mengo-clinic",
      legal_name: "Mengo Clinic Ltd",
      email: "manager@mengoclinic.ug",
      subdomain: "mengo-clinic",
      tenant_kind: "clinic",
    },
  },
  "mukono-medical-centre": {
    workspaceId: "mukono-medical-centre",
    tenant: {
      name: "Mukono Medical Centre",
      slug: "mukono-medical-centre",
      legal_name: "Mukono Medical Centre Ltd",
      email: "admin@mukonomedical.ug",
      subdomain: "mukono-medical-centre",
      tenant_kind: "clinic",
    },
  },
  "vine-pharmacy": {
    workspaceId: "vine-pharmacy",
    tenant: {
      name: "Vine Pharmacy",
      slug: "vine-pharmacy",
      legal_name: "Vine Pharmacy Ltd",
      email: "pharmacy@vinepharmacy.ug",
      subdomain: "vine-pharmacy",
      tenant_kind: "pharmacy",
    },
  },
  "goodlife-pharmacy": {
    workspaceId: "goodlife-pharmacy",
    tenant: {
      name: "GoodLife Pharmacy",
      slug: "goodlife-pharmacy",
      legal_name: "GoodLife Pharmacy Ltd",
      email: "manager@goodlifepharmacy.ug",
      subdomain: "goodlife-pharmacy",
      tenant_kind: "pharmacy",
    },
  },
  mediplus: {
    workspaceId: "goodlife-pharmacy",
    tenant: {
      name: "GoodLife Pharmacy",
      slug: "goodlife-pharmacy",
      legal_name: "GoodLife Pharmacy Ltd",
      email: "manager@goodlifepharmacy.ug",
      subdomain: "goodlife-pharmacy",
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
    email: "owner@medilink.africa",
    password: "demo12345",
    fullName: "MediLink Platform Owner",
    role: "admin",
    workspaceId: "kampala-hospital",
    description: "MediLink Platform Owner",
    isPlatformAdmin: true,
  },
  {
    email: "admin@kampalahospital.ug",
    password: "demo12345",
    fullName: "Kato Byaruhanga",
    role: "admin",
    workspaceId: "kampala-hospital",
    description: "Hospital Administrator - Operations & Staff Control",
  },
  {
    email: "manager@mengoclinic.ug",
    password: "demo12345",
    fullName: "Nakato Ssempijja",
    role: "admin",
    workspaceId: "mengo-clinic",
    description: "Clinic Manager - Front Desk & Branch Operations",
  },
  {
    email: "admin@mukonomedical.ug",
    password: "demo12345",
    fullName: "Achan Byaruhanga",
    role: "admin",
    workspaceId: "mukono-medical-centre",
    description: "Medical Center Admin - Departments & Billing",
  },
  {
    email: "pharmacy@vinepharmacy.ug",
    password: "demo12345",
    fullName: "Turyasingura Nankya",
    role: "pharmacist",
    workspaceId: "vine-pharmacy",
    description: "Pharmacy Manager - Stock & Dispensing Control",
  },
  {
    email: "manager@goodlifepharmacy.ug",
    password: "demo12345",
    fullName: "Okello Mwangi",
    role: "pharmacist",
    workspaceId: "goodlife-pharmacy",
    description: "Branch Pharmacist - Inventory & Refills",
  },
  {
    email: "dr.namusoke@kampalahospital.ug",
    password: "demo12345",
    fullName: "Dr. Sarah Namusoke",
    role: "doctor",
    workspaceId: "kampala-hospital",
    description: "Senior Medical Officer - Patient Records",
  },
  {
    email: "reception@mengoclinic.ug",
    password: "demo12345",
    fullName: "Nankya Ssempijja",
    role: "receptionist",
    workspaceId: "mengo-clinic",
    description: "Front Desk Reception - Appointments & Patient Intake",
  },
  {
    email: "patient@medilinkdemo.ug",
    password: "demo12345",
    fullName: "Brian Kato",
    role: "patient",
    workspaceId: "kampala-hospital",
    description: "Patient Account - Book Appointments",
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
