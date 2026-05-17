import { CheckCircle2, ExternalLink, Settings, XCircle } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appConfig, hasSupabaseConfig } from "@/lib/config";
import { getDashboardData } from "@/lib/data/repositories";
import { tenantHostForSubdomain } from "@/lib/tenant-host";

const checks = [
  ["Supabase URL", "NEXT_PUBLIC_SUPABASE_URL", Boolean(appConfig.supabaseUrl)],
  ["Supabase anon key", "NEXT_PUBLIC_SUPABASE_ANON_KEY", Boolean(appConfig.supabaseAnonKey)],
  ["Service role key", "SUPABASE_SERVICE_ROLE_KEY", Boolean(appConfig.supabaseServiceRoleKey)],
  ["Flutterwave", "FLUTTERWAVE_SECRET_KEY", Boolean(appConfig.flutterwave.secretKey)],
  ["MTN MoMo", "MTN_MOMO_API_USER / MTN_MOMO_API_KEY", Boolean(appConfig.mtn.apiUser && appConfig.mtn.apiKey)],
  ["Airtel Money", "AIRTEL_MONEY_CLIENT_ID / AIRTEL_MONEY_CLIENT_SECRET", Boolean(appConfig.airtel.clientId && appConfig.airtel.clientSecret)],
  ["WhatsApp", "WHATSAPP_CLOUD_API_TOKEN", Boolean(appConfig.whatsapp.token)],
] as const;

export default async function SettingsPage() {
  const data = await getDashboardData();
  const isPharmacy = data.tenant.tenant_kind === "pharmacy";
  const tenantHost = tenantHostForSubdomain(data.tenant.subdomain);

  return (
    <div>
      <PageHeading
        eyebrow="Settings"
        title={isPharmacy ? "Pharmacy workspace" : "Clinic workspace"}
        description="Tenant identity, deployment readiness, and integration configuration."
        actions={
          <Button variant="secondary">
            <ExternalLink className="size-4" />
            Open Supabase
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.7fr)_minmax(0,1.3fr)]">
        <Card>
          <CardHeader>
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Settings className="size-5" />
            </div>
            <CardTitle className="mt-4">{data.tenant.name}</CardTitle>
            <CardDescription>{data.tenant.address}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Type</span>
              <span className="capitalize font-medium text-slate-950">{data.tenant.tenant_kind}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Tenant ID</span>
              <span className="truncate font-mono text-xs text-slate-700">{data.tenant.id}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Subdomain</span>
              <span className="font-medium text-slate-950">{tenantHost}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Mode</span>
              <Badge tone={hasSupabaseConfig() ? "green" : "amber"}>
                {hasSupabaseConfig() ? "Production data" : "Demo fallback"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deployment checklist</CardTitle>
            <CardDescription>Set these variables in Vercel before serving real clinics.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {checks.map(([label, variable, ready]) => (
              <div key={variable} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-4">
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
  );
}
