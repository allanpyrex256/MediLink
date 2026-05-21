import {
  CheckCircle2,
  ExternalLink,
  Link2,
  MapPin,
  Paintbrush,
  Settings,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandingImageUploads } from "@/components/dashboard/branding-image-uploads";
import { PageHeading } from "@/components/dashboard/page-heading";
import { WorkflowActionButton } from "@/components/dashboard/workflow-action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Select } from "@/components/ui/select";
import { appConfig, hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { getDashboardData } from "@/lib/data/repositories";
import { brandGradient, tenantBranding, tenantThemeOptions } from "@/lib/tenant-branding";
import { tenantHostForSubdomain } from "@/lib/tenant-host";
import { formatUgandanCurrency } from "@/lib/utils";

const checks = [
  ["Supabase URL", "NEXT_PUBLIC_SUPABASE_URL", Boolean(appConfig.supabaseUrl)],
  ["Supabase anon key", "NEXT_PUBLIC_SUPABASE_ANON_KEY", Boolean(appConfig.supabaseAnonKey)],
  ["Service role key", "SUPABASE_SERVICE_ROLE_KEY", Boolean(appConfig.supabaseServiceRoleKey)],
  ["Flutterwave", "FLUTTERWAVE_CLIENT_ID / FLUTTERWAVE_CLIENT_SECRET", Boolean(appConfig.flutterwave.clientId && appConfig.flutterwave.clientSecret)],
  ["MTN MoMo", "MTN_MOMO_API_USER / MTN_MOMO_API_KEY", Boolean(appConfig.mtn.apiUser && appConfig.mtn.apiKey)],
  ["Airtel Money", "AIRTEL_MONEY_CLIENT_ID / AIRTEL_MONEY_CLIENT_SECRET", Boolean(appConfig.airtel.clientId && appConfig.airtel.clientSecret)],
  ["WhatsApp", "WHATSAPP_CLOUD_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID", Boolean(appConfig.whatsapp.token && appConfig.whatsapp.phoneNumberId)],
] as const;

export default async function SettingsPage() {
  const data = await getDashboardData();
  const brand = tenantBranding(data.tenant);
  const tenantHost = data.tenant.subdomain
    ? `${data.tenant.subdomain}.medilink.ug`
    : tenantHostForSubdomain(data.tenant.subdomain);
  const branchRevenue = data.branches.reduce((sum, branch) => sum + branch.revenue_month, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Settings"
        title="Organization Profile"
        description={`${brand.name} branding, contact details, branches, colors, and custom domain setup.`}
        actions={
          <WorkflowActionButton
            variant="secondary"
            title="Open Supabase"
            description="Supabase project links should open from your owner/admin environment once the production project URL is configured."
          >
            <ExternalLink className="size-4" />
            Open Supabase
          </WorkflowActionButton>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <Card className="overflow-hidden">
          <div className="h-32" style={{ background: brandGradient(brand) }} />
          <CardContent className="-mt-10 grid gap-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <Logo
                label={brand.name}
                tagline={brand.tagline}
                imageUrl={brand.logoUrl}
                initials={brand.initials}
                color={brand.primaryColor}
              />
            </div>
            <div className="grid gap-3 text-sm">
              <ProfileRow label="Business type" value={data.tenant.tenant_kind} capitalize />
              <ProfileRow label="Phone" value={brand.phone} />
              <ProfileRow label="Email" value={brand.email} />
              <ProfileRow label="Address" value={brand.address} />
              <ProfileRow label="Custom subdomain" value={tenantHost} />
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Mode</span>
                <Badge tone={hasSupabaseConfig() ? "green" : "amber"}>
                  {hasSupabaseConfig() ? "Production data" : "Demo fallback"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <IconBox icon={Settings} color={brand.primaryColor} />
                <div>
                  <CardTitle>Organization Profile</CardTitle>
                  <CardDescription>Name, contact information, logo, cover image, and profile image.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Business name" defaultValue={brand.name} readOnly />
                <Input label="Legal name" defaultValue={brand.legalName} readOnly />
                <Input label="Phone number" defaultValue={brand.phone} readOnly />
                <Input label="Email" defaultValue={brand.email} readOnly />
              </div>
              <Input label="Address" defaultValue={brand.address} readOnly />
              <BrandingImageUploads
                canPersist={hasSupabaseAdminConfig()}
                coverImageUrl={brand.coverImageUrl}
                logoUrl={brand.logoUrl}
                profileImageUrl={brand.profileImageUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <IconBox icon={Paintbrush} color={brand.primaryColor} />
                <div>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>Tenant theme used on the sidebar, login, receipts, reports, and booking page.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Primary color" defaultValue={brand.primaryColor} readOnly />
                <Input label="Accent color" defaultValue={brand.accentColor} readOnly />
                <Select label="Theme selection" defaultValue={brand.theme}>
                  {tenantThemeOptions.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {tenantThemeOptions.map((theme) => (
                  <div key={theme.value} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div
                      className="h-10 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                      }}
                    />
                    <p className="mt-2 text-sm font-bold text-slate-950">{theme.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <IconBox icon={MapPin} color={brand.primaryColor} />
              <div>
                <CardTitle>Branch Information</CardTitle>
                <CardDescription>Branches, managers, daily activity, monthly revenue, and staff coverage.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Branch</th>
                  <th className="px-5 py-3 font-semibold">Region</th>
                  <th className="px-5 py-3 font-semibold">Manager</th>
                  <th className="px-5 py-3 font-semibold">Today</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-bold text-slate-950">{branch.name}</td>
                    <td className="px-5 py-4 text-slate-700">{branch.region}</td>
                    <td className="px-5 py-4 text-slate-700">{branch.manager}</td>
                    <td className="px-5 py-4 text-slate-700">{branch.patients_today}</td>
                    <td className="px-5 py-4 font-semibold text-slate-950">
                      {formatUgandanCurrency(branch.revenue_month)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={branch.status === "active" ? "green" : "amber"} className="capitalize">
                        {branch.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <IconBox icon={Link2} color={brand.primaryColor} />
                <div>
                  <CardTitle>Custom Subdomain</CardTitle>
                  <CardDescription>Enterprise tenant URL and booking link identity.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="break-all text-sm font-bold text-slate-950">{tenantHost}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">Storage usage: {data.tenant.storage_usage_mb ?? 0} MB</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">Branch revenue this month</p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">
                  {formatUgandanCurrency(branchRevenue)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Checklist</CardTitle>
              <CardDescription>Environment status for live payments, auth, storage, and messaging.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {checks.map(([label, variable, ready]) => (
                <div key={variable} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{label}</p>
                    <p className="mt-1 font-mono text-xs text-slate-500">{variable}</p>
                  </div>
                  {ready ? (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  ) : (
                    <XCircle className="size-5 text-amber-500" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IconBox({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  return (
    <div className="grid size-12 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
      <Icon className="size-5" />
    </div>
  );
}

function ProfileRow({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={capitalize ? "font-medium capitalize text-slate-950" : "text-right font-medium text-slate-950"}>
        {value}
      </span>
    </div>
  );
}
