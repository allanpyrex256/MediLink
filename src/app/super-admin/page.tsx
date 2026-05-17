import { Building2, Power, ShieldCheck } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, getPlatformTenants } from "@/lib/data/repositories";
import { tenantHostForSubdomain } from "@/lib/tenant-host";

const tone = {
  active: "green",
  trialing: "blue",
  past_due: "amber",
  disabled: "rose",
} as const;

export default async function SuperAdminPage() {
  const [data, tenants] = await Promise.all([getDashboardData(), getPlatformTenants()]);

  return (
    <div>
      <PageHeading
        eyebrow="Platform owner"
        title="Super admin"
        description="Monitor tenants, subscriptions, and platform-level revenue without breaking clinic data isolation."
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{tenants.length}</p>
              <p className="text-sm text-slate-500">Organizations onboarded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{data.user.is_platform_admin ? "Enabled" : "Scoped"}</p>
              <p className="text-sm text-slate-500">Platform permissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <Power className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">99.9%</p>
              <p className="text-sm text-slate-500">Target uptime</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organization tenants</CardTitle>
          <CardDescription>Subscription and operational status across the MediLink platform.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Organization</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Region</th>
                <th className="px-5 py-3 font-semibold">Subdomain</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-950">{tenant.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{tenant.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={tenant.tenant_kind === "pharmacy" ? "blue" : "slate"} className="capitalize">
                      {tenant.tenant_kind}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{tenant.region}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{tenantHostForSubdomain(tenant.subdomain)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={tone[tenant.status]} className="capitalize">
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">Manage</Button>
                      <Button variant={tenant.status === "disabled" ? "primary" : "danger"} size="sm">
                        {tenant.status === "disabled" ? "Enable" : "Disable"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
