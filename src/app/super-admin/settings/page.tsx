import { Ban, CheckCircle2, Database, Globe2, ImageUp, RotateCcw, ShieldCheck } from "lucide-react";
import {
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import type { PlatformTenant } from "@/lib/platform-demo";
import { getPlatformOverview } from "@/lib/platform-live";
import { slugify } from "@/lib/utils";

export const metadata = {
  title: "Platform Settings | MediLink",
};

const ownerControls = [
  {
    title: "Approve logos",
    description: "Review tenant logos before they appear on receipts, reports, and public booking pages.",
    icon: ImageUp,
  },
  {
    title: "Suspend tenants",
    description: "Pause access for expired accounts while keeping their tenant data intact.",
    icon: Ban,
  },
  {
    title: "Reset branding",
    description: "Restore default MediLink-safe colors and generated initials for any tenant.",
    icon: RotateCcw,
  },
  {
    title: "Manage domains",
    description: "Control tenant subdomains, custom domains, DNS verification, and booking URLs.",
    icon: Globe2,
  },
  {
    title: "Monitor storage",
    description: "Track logos, cover images, reports, receipts, prescriptions, and uploaded documents.",
    icon: Database,
  },
  {
    title: "Owner access",
    description: "Protect platform owner controls, support routing, audit visibility, and account recovery.",
    icon: ShieldCheck,
  },
];

export default async function SettingsPage() {
  const { tenants } = await getPlatformOverview();
  const brandingQueue = brandingQueueForTenants(tenants);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Platform control"
        title="Settings"
        description="Approve logos, manage domains, reset tenant branding, suspend accounts, and monitor storage usage."
        icon={sectionIcons.settings}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {ownerControls.map((control) => {
          const Icon = control.icon;
          return (
            <Card key={control.title}>
              <CardHeader>
                <div className="grid size-12 place-items-center rounded-lg bg-violet-100 text-violet-700">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="mt-4">{control.title}</CardTitle>
                <CardDescription>{control.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Open control
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tenant branding queue</CardTitle>
              <CardDescription>Logo approval, domain, theme, storage, and subscription status.</CardDescription>
            </div>
            <Logo compact />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Business</th>
                <th className="px-5 py-3 font-semibold">Domain</th>
                <th className="px-5 py-3 font-semibold">Logo</th>
                <th className="px-5 py-3 font-semibold">Theme</th>
                <th className="px-5 py-3 font-semibold">Storage</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brandingQueue.map((item) => (
                <tr key={item.business} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-bold text-slate-950">{item.business}</td>
                  <td className="px-5 py-4 text-slate-700">{item.domain}</td>
                  <td className="px-5 py-4">
                    <Badge tone={item.logo === "Approved" ? "green" : "amber"}>{item.logo}</Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{item.theme}</td>
                  <td className="px-5 py-4 font-semibold text-slate-950">{item.storage}</td>
                  <td className="px-5 py-4">
                    <Badge
                      tone={item.status === "active" ? "green" : item.status === "trialing" ? "blue" : item.status === "past_due" ? "amber" : "rose"}
                      className="capitalize"
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Button variant="ghost" size="sm">
                      <CheckCircle2 className="size-4" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Summary label="Tenants" value={String(tenants.length)} />
        <Summary label="Logos approved" value={String(brandingQueue.filter((item) => item.logo === "Approved").length)} />
        <Summary label="Storage used" value="1.2 GB" />
      </div>
    </div>
  );
}

function brandingQueueForTenants(tenants: PlatformTenant[]) {
  return tenants.slice(0, 6).map((tenant, index) => ({
    business: tenant.business,
    domain: `${slugify(tenant.business)}.medilink.ug`,
    logo: tenant.status === "trialing" ? "Needs review" : "Approved",
    theme: tenant.kind === "pharmacy" ? "Green" : tenant.kind === "hospital" ? "Purple" : "Blue",
    storage: `${120 + index * 36} MB`,
    status: tenant.status,
  }));
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}
