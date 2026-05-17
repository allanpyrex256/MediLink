import type { MetadataRoute } from "next";
import {
  getPublicTenantDirectory,
  publicTenantProfileUrl,
} from "@/lib/public-directory";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const listings = await getPublicTenantDirectory();

  const marketingRoutes = [
    { path: "/", priority: 1 },
    { path: "/features", priority: 0.7 },
    { path: "/solutions", priority: 0.7 },
    { path: "/resources", priority: 0.6 },
    { path: "/clinics", priority: 0.9 },
  ] satisfies Array<{ path: string; priority: number }>;

  return [
    ...marketingRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...listings.map((listing) => ({
      url: absoluteUrl(publicTenantProfileUrl(listing.tenant)),
      lastModified: new Date(listing.tenant.created_at ?? now),
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  ];
}
