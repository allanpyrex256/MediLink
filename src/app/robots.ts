import type { MetadataRoute } from "next";
import { absoluteUrl, siteBaseUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/dashboard/",
        "/demo/",
        "/demo-flow/",
        "/super-admin/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteBaseUrl(),
  };
}
