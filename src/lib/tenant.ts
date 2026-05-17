import { headers } from "next/headers";
import { buildDemoDashboardData, demoTenant } from "@/lib/demo-data";
import { demoTenantProfileForSlug, demoWorkspaceIdForSlug } from "@/lib/demo-session";
import { tenantSlugFromHost } from "@/lib/tenant-host";

export { tenantSlugFromHost } from "@/lib/tenant-host";

export async function getTenantSlugFromRequest() {
  const headerStore = await headers();
  return tenantSlugFromHost(headerStore.get("host"));
}

export function getDemoTenantForHost(hostHeader: string | null) {
  const slug = tenantSlugFromHost(hostHeader);
  const workspaceId = demoWorkspaceIdForSlug(slug);
  if (workspaceId) {
    const data = buildDemoDashboardData(workspaceId);
    const profile = demoTenantProfileForSlug(slug);

    return profile?.workspaceId === workspaceId
      ? {
          ...data.tenant,
          ...profile.tenant,
        }
      : data.tenant;
  }
  if (!slug || slug === demoTenant.subdomain) return demoTenant;
  return { ...demoTenant, slug, subdomain: slug, name: `${slug} Clinic` };
}
