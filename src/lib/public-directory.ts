import { addDays } from "date-fns";
import { hasSupabaseAdminConfig, isDemoModeAllowed } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import {
  demoTenantProfileForSlug,
  demoWorkspaceIdForSlug,
  demoWorkspaceOptions,
} from "@/lib/demo-session";
import { hydrateLocalDemoDashboardData } from "@/lib/local-demo-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Doctor, InventoryItem, Tenant } from "@/lib/types";

export type PublicTenantListing = {
  tenant: Tenant;
  doctorsCount: number;
  stockCount: number;
  services: string[];
};

export type PublicTenantProfile = PublicTenantListing & {
  doctors: Doctor[];
  inventory: InventoryItem[];
};

export function normalizePublicSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
}

export async function getPublicTenantDirectory(): Promise<PublicTenantListing[]> {
  if (!hasSupabaseAdminConfig()) {
    if (!isDemoModeAllowed()) return [];

    const listings = await Promise.all(
      demoWorkspaceOptions.map(async (workspace) => {
        const data = await hydrateLocalDemoDashboardData(
          buildDemoDashboardData(workspace.id),
          workspace.id,
        );
        const profile = demoTenantProfileForSlug(workspace.id);
        const tenant =
          profile?.workspaceId === workspace.id
            ? {
                ...data.tenant,
                ...profile.tenant,
              }
            : data.tenant;

        return toPublicTenantListing({
          tenant,
          doctors: data.doctors,
          inventory: data.inventory,
        });
      }),
    );

    return listings;
  }

  const supabase = createSupabaseAdminClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .neq("status", "disabled")
    .order("name");

  if (!tenants?.length) return [];

  const tenantIds = tenants.map((tenant) => tenant.id);
  const [{ data: doctors }, { data: inventory }] = await Promise.all([
    supabase
      .from("doctors")
      .select("*")
      .in("tenant_id", tenantIds)
      .neq("status", "offline"),
    supabase
      .from("inventory_items")
      .select("*")
      .in("tenant_id", tenantIds)
      .gt("stock_on_hand", 0)
      .limit(300),
  ]);

  return (tenants as Tenant[]).map((tenant) =>
    toPublicTenantListing({
      tenant,
      doctors: ((doctors ?? []) as Doctor[]).filter((doctor) => doctor.tenant_id === tenant.id),
      inventory: ((inventory ?? []) as InventoryItem[]).filter((item) => item.tenant_id === tenant.id),
    }),
  );
}

export async function getPublicTenantProfile(slug: string): Promise<PublicTenantProfile | null> {
  const normalized = normalizePublicSlug(slug);

  if (!hasSupabaseAdminConfig()) {
    if (!isDemoModeAllowed()) return null;

    const workspaceId = demoWorkspaceIdForSlug(normalized);
    if (!workspaceId) return null;

    const data = await hydrateLocalDemoDashboardData(
      buildDemoDashboardData(workspaceId),
      workspaceId,
    );
    const profile = demoTenantProfileForSlug(normalized);
    const tenant =
      profile?.workspaceId === workspaceId
        ? {
            ...data.tenant,
            ...profile.tenant,
          }
        : data.tenant;

    return {
      ...toPublicTenantListing({
        tenant,
        doctors: data.doctors,
        inventory: data.inventory,
      }),
      doctors: data.doctors.filter((doctor) => doctor.status !== "offline"),
      inventory: data.inventory,
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .neq("status", "disabled")
    .or(`slug.eq.${normalized},subdomain.eq.${normalized}`)
    .limit(1);

  if (!tenants?.[0]) return null;

  const tenant = tenants[0] as Tenant;
  const [{ data: doctors }, { data: inventory }] = await Promise.all([
    supabase
      .from("doctors")
      .select("*")
      .eq("tenant_id", tenant.id)
      .neq("status", "offline")
      .order("full_name"),
    supabase
      .from("inventory_items")
      .select("*")
      .eq("tenant_id", tenant.id)
      .gt("stock_on_hand", 0)
      .order("name")
      .limit(80),
  ]);

  const liveDoctors = (doctors ?? []) as Doctor[];
  const liveInventory = (inventory ?? []) as InventoryItem[];

  return {
    ...toPublicTenantListing({ tenant, doctors: liveDoctors, inventory: liveInventory }),
    doctors: liveDoctors,
    inventory: liveInventory,
  };
}

export function publicTenantProfileUrl(tenant: Pick<Tenant, "slug">) {
  return `/clinics/${tenant.slug}`;
}

export function publicTenantPayUrl(tenant: Pick<Tenant, "slug">) {
  return `/${tenant.slug}/pay`;
}

export function publicTenantPharmacyUrl(tenant: Pick<Tenant, "slug">) {
  return `/${tenant.slug}/pharmacy`;
}

export function publicTenantBookUrl(tenant: Pick<Tenant, "slug">) {
  return `/${tenant.slug}/book`;
}

export function publicReference(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function publicFulfillmentDate() {
  return addDays(new Date(), 1).toISOString();
}

function toPublicTenantListing({
  tenant,
  doctors,
  inventory,
}: {
  tenant: Tenant;
  doctors: Doctor[];
  inventory: InventoryItem[];
}): PublicTenantListing {
  const doctorServices = doctors
    .filter((doctor) => doctor.status !== "offline")
    .map((doctor) => doctor.specialization);
  const inventoryServices = inventory.slice(0, 6).map((item) => item.category);
  const services = Array.from(new Set([...doctorServices, ...inventoryServices])).slice(0, 5);

  return {
    tenant,
    doctorsCount: doctors.filter((doctor) => doctor.status !== "offline").length,
    stockCount: inventory.filter((item) => item.stock_on_hand > 0).length,
    services,
  };
}
