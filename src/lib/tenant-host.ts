import type { Tenant } from "@/lib/types";

const tenantRootDomains = [
  "medilink.ug",
  "medilink.test",
  "medilink.local",
  "localhost",
] as const;

const platformHosts = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "medilink.ug",
  "www.medilink.ug",
  "medilink.test",
  "www.medilink.test",
  "medilink.local",
  "www.medilink.local",
]);

export function normalizeHost(hostHeader: string | null | undefined) {
  if (!hostHeader) return null;

  const trimmed = hostHeader.trim().toLowerCase();
  if (!trimmed) return null;

  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    return end > 0 ? trimmed.slice(1, end) : null;
  }

  return trimmed.split(":")[0] || null;
}

export function tenantRootDomainFromHost(hostHeader: string | null | undefined) {
  const host = normalizeHost(hostHeader);
  if (!host) return null;

  return (
    tenantRootDomains.find(
      (rootDomain) => host === rootDomain || host.endsWith(`.${rootDomain}`),
    ) ?? null
  );
}

export function tenantSlugFromHost(hostHeader: string | null | undefined) {
  const host = normalizeHost(hostHeader);
  if (!host || platformHosts.has(host)) return null;

  const rootDomain = tenantRootDomainFromHost(host);
  if (!rootDomain) return null;

  const suffix = `.${rootDomain}`;
  if (!host.endsWith(suffix)) return null;

  const tenantPart = host.slice(0, -suffix.length);
  const [slug] = tenantPart.split(".");

  return slug && slug !== "www" ? slug : null;
}

export function isLocalDevelopmentHost(hostHeader: string | null | undefined) {
  const host = normalizeHost(hostHeader);
  if (!host) return false;

  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "medilink.test" ||
    host.endsWith(".medilink.test") ||
    host === "medilink.local" ||
    host.endsWith(".medilink.local")
  );
}

export function cookieDomainForHost(hostHeader: string | null | undefined) {
  const rootDomain = tenantRootDomainFromHost(hostHeader);
  if (!rootDomain || rootDomain === "localhost") return undefined;

  return `.${rootDomain}`;
}

export function configuredTenantRootDomain(
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
) {
  if (process.env.NEXT_PUBLIC_TENANT_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_TENANT_ROOT_DOMAIN;
  }

  try {
    const rootDomain = tenantRootDomainFromHost(new URL(siteUrl).hostname);
    if (rootDomain) return rootDomain;
  } catch {
    // Fall back to the production root below.
  }

  return "medilink.ug";
}

export function tenantHostForSubdomain(subdomain: string | null | undefined) {
  const rootDomain = configuredTenantRootDomain();
  return subdomain ? `${subdomain}.${rootDomain}` : rootDomain;
}

export function tenantBookingUrl(
  tenant: Pick<Tenant, "slug" | "subdomain">,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
) {
  const trimmedSiteUrl = siteUrl.replace(/\/$/, "");

  try {
    const url = new URL(siteUrl);
    const rootDomain = tenantRootDomainFromHost(url.hostname);
    const subdomain = tenant.subdomain ?? tenant.slug;

    if (rootDomain && subdomain) {
      url.hostname = `${subdomain}.${rootDomain}`;
      url.pathname = "/book";
      url.search = "";
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // Use the path-based URL below when the configured site URL is incomplete.
  }

  return `${trimmedSiteUrl}/${tenant.slug}/book`;
}
