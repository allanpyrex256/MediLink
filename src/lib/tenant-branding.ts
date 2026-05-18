import type { Tenant, TenantKind, TenantTheme } from "@/lib/types";
import { initials } from "@/lib/utils";

type BrandDefaults = {
  primaryColor: string;
  accentColor: string;
  tagline: string;
  theme: TenantTheme;
};

export type TenantBrand = {
  name: string;
  legalName: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  profileImageUrl: string | null;
  primaryColor: string;
  accentColor: string;
  theme: TenantTheme;
  tagline: string;
  initials: string;
  phone: string;
  email: string;
  address: string;
  subdomain: string | null;
};

export const tenantThemeOptions: Array<{
  label: string;
  value: TenantTheme;
  primaryColor: string;
  accentColor: string;
}> = [
  { label: "Purple", value: "purple", primaryColor: "#7c3aed", accentColor: "#0ea5e9" },
  { label: "Blue", value: "blue", primaryColor: "#0f6fdc", accentColor: "#14b8a6" },
  { label: "Green", value: "green", primaryColor: "#047857", accentColor: "#f59e0b" },
  { label: "Dark Mode", value: "dark", primaryColor: "#111827", accentColor: "#22c55e" },
];

const defaultsByKind: Record<TenantKind, BrandDefaults> = {
  hospital: {
    primaryColor: "#6d28d9",
    accentColor: "#0ea5e9",
    tagline: "Hospital operations system",
    theme: "purple",
  },
  clinic: {
    primaryColor: "#0f6fdc",
    accentColor: "#10b981",
    tagline: "Clinic management system",
    theme: "blue",
  },
  pharmacy: {
    primaryColor: "#047857",
    accentColor: "#f59e0b",
    tagline: "Pharmacy POS and inventory system",
    theme: "green",
  },
  dentistry: {
    primaryColor: "#0891b2",
    accentColor: "#14b8a6",
    tagline: "Dental practice management system",
    theme: "blue",
  },
};

const demoBrandOverrides: Record<string, Partial<TenantBrand>> = {
  "kampala-hospital": {
    primaryColor: "#6d28d9",
    accentColor: "#0ea5e9",
    tagline: "Daily hospital operations",
  },
  "mengo-clinic": {
    primaryColor: "#0f6fdc",
    accentColor: "#14b8a6",
    tagline: "Outpatient clinic operations",
  },
  "mukono-medical-centre": {
    primaryColor: "#047857",
    accentColor: "#0ea5e9",
    tagline: "Medical centre management",
  },
  "vine-pharmacy": {
    primaryColor: "#047857",
    accentColor: "#f59e0b",
    tagline: "Pharmacy POS and stock control",
  },
  "goodlife-pharmacy": {
    primaryColor: "#0f766e",
    accentColor: "#7c3aed",
    tagline: "Branch pharmacy operations",
  },
  "pearl-dental": {
    primaryColor: "#0891b2",
    accentColor: "#14b8a6",
    tagline: "Dental appointments and treatment planning",
  },
};

export function tenantBranding(tenant: Tenant): TenantBrand {
  const defaults = defaultsByKind[tenant.tenant_kind];
  const override = demoBrandOverrides[tenant.slug] ?? {};

  return {
    name: tenant.name,
    legalName: tenant.legal_name,
    logoUrl: tenant.logo_url ?? null,
    coverImageUrl: tenant.cover_image_url ?? null,
    profileImageUrl: tenant.profile_image_url ?? null,
    primaryColor: tenant.primary_color ?? override.primaryColor ?? defaults.primaryColor,
    accentColor: tenant.accent_color ?? override.accentColor ?? defaults.accentColor,
    theme: tenant.theme ?? defaults.theme,
    tagline: tenant.brand_tagline ?? override.tagline ?? defaults.tagline,
    initials: initials(tenant.name) || "ML",
    phone: tenant.phone,
    email: tenant.email,
    address: tenant.address,
    subdomain: tenant.subdomain,
  };
}

export function brandGradient(brand: Pick<TenantBrand, "primaryColor" | "accentColor">) {
  return `linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.accentColor} 100%)`;
}
